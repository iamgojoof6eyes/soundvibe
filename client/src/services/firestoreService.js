import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove, 
  increment 
} from '../firebase';

const USERS_COL = 'users';
const POSTS_COL = 'posts';

// Helper to generate a clean safe ID
export const generateId = (prefix = 'item') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

// ================= USER OPERATIONS =================

/**
 * Get or sync user in Firestore
 */
export const getFirestoreUser = async (uidOrUsername) => {
  if (!uidOrUsername) return null;
  try {
    if (!db) return null;
    // 1. Try by document ID (Auth UID)
    const docRef = doc(db, USERS_COL, uidOrUsername);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }

    // 2. Query by username
    const q = query(
      collection(db, USERS_COL),
      where('username', '==', uidOrUsername.toLowerCase().trim())
    );
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const docData = querySnap.docs[0];
      return { id: docData.id, ...docData.data() };
    }

    return null;
  } catch (err) {
    console.warn('Firestore get user notice:', err);
    return null;
  }
};

/**
 * Save or update user profile in Firestore
 */
export const saveFirestoreUser = async (uid, userData) => {
  if (!uid) return null;
  try {
    if (!db) return userData;
    const userRef = doc(db, USERS_COL, uid);
    const existing = await getDoc(userRef);

    const payload = {
      ...userData,
      updatedAt: serverTimestamp()
    };

    if (!existing.exists()) {
      payload.createdAt = serverTimestamp();
      payload.followers = payload.followers || [];
      payload.following = payload.following || [];
      payload.favoriteGenres = payload.favoriteGenres || ['Indie Rock', 'Electronic'];
      payload.topTracks = payload.topTracks || [];
      payload.badges = payload.badges || ['Curator'];
    }

    await setDoc(userRef, payload, { merge: true });
    const updatedSnap = await getDoc(userRef);

    // Also cascade author profile updates to user's existing posts in Firestore
    if (userData.username || userData.name || userData.avatar) {
      try {
        const postsQuery = query(collection(db, POSTS_COL), where('userId', '==', uid));
        const postsSnap = await getDocs(postsQuery);
        postsSnap.forEach(async (pDoc) => {
          const pData = pDoc.data();
          const updatedAuthor = {
            ...(pData.author || {}),
            id: uid,
            username: userData.username || pData.author?.username,
            name: userData.name || pData.author?.name,
            avatar: userData.avatar || pData.author?.avatar
          };
          await updateDoc(doc(db, POSTS_COL, pDoc.id), {
            author: updatedAuthor
          });
        });
      } catch (postSyncErr) {
        console.warn('Silent post author sync notice:', postSyncErr);
      }
    }

    return { id: updatedSnap.id, ...updatedSnap.data() };
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
    return null;
  }
};

/**
 * Toggle follow/unfollow in Firestore
 */
export const toggleFollowFirestore = async (currentUid, targetUidOrUsername) => {
  if (!currentUid || !targetUidOrUsername) return null;
  try {
    if (!db) return null;
    const targetUser = await getFirestoreUser(targetUidOrUsername);
    if (!targetUser) throw new Error('Target user not found');
    const targetUid = targetUser.id;

    if (currentUid === targetUid) throw new Error('Cannot follow yourself');

    const currentUserRef = doc(db, USERS_COL, currentUid);
    const targetUserRef = doc(db, USERS_COL, targetUid);

    const currentUserSnap = await getDoc(currentUserRef);
    const currentUserData = currentUserSnap.data() || {};
    const following = currentUserData.following || [];

    const isFollowing = following.includes(targetUid) || following.includes(targetUser.username);

    if (isFollowing) {
      await updateDoc(currentUserRef, {
        following: arrayRemove(targetUid, targetUser.username)
      });
      await updateDoc(targetUserRef, {
        followers: arrayRemove(currentUid, currentUserData.username)
      });
    } else {
      await updateDoc(currentUserRef, {
        following: arrayUnion(targetUid)
      });
      await updateDoc(targetUserRef, {
        followers: arrayUnion(currentUid)
      });
    }

    const updatedUserSnap = await getDoc(currentUserRef);
    return {
      isFollowing: !isFollowing,
      following: updatedUserSnap.data()?.following || []
    };
  } catch (err) {
    console.error('Error in toggleFollowFirestore:', err);
    throw err;
  }
};

// ================= POST OPERATIONS =================

/**
 * Fetch all posts from Firestore with sorting & filtering
 */
export const getFirestorePosts = async ({ filter, genre, userId, authorUsername, currentUserId } = {}) => {
  try {
    if (!db) {
      const res = await fetch('/api/posts');
      const data = await res.json();
      return data.posts || [];
    }

    let q = collection(db, POSTS_COL);
    const snap = await getDocs(q);

    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Filter by genre
    if (genre && genre !== 'All') {
      const gLower = genre.toLowerCase();
      list = list.filter(p => 
        (p.track?.genre && p.track.genre.toLowerCase().includes(gLower)) ||
        (p.vibeTags || []).some(t => t.toLowerCase().includes(gLower))
      );
    }

    // Filter by specific user (matches by permanent UID or handle)
    if (userId || authorUsername) {
      const targetUid = userId;
      const targetUser = (authorUsername || userId || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
      list = list.filter(p => {
        const pUid = p.userId || p.author?.id || p.author?.uid;
        const pUsername = (p.author?.username || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
        return (targetUid && (pUid === targetUid || p.userId === targetUid)) ||
               (targetUser && (pUsername === targetUser || pUid === targetUser));
      });
    }

    // Filter following
    if (filter === 'following' && currentUserId) {
      const currentUser = await getFirestoreUser(currentUserId);
      const followingList = currentUser?.following || [];
      list = list.filter(p => 
        followingList.includes(p.userId) || 
        followingList.includes(p.author?.id) || 
        followingList.includes(p.author?.username)
      );
    }

    // Sort
    if (filter === 'trending') {
      list.sort((a, b) => {
        const reactionsA = Object.values(a.reactions || {}).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
        const reactionsB = Object.values(b.reactions || {}).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
        return (reactionsB + (b.comments?.length || 0)) - (reactionsA + (a.comments?.length || 0));
      });
    } else if (filter === 'top-rated') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Default: Newest first
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    }

    return list;
  } catch (err) {
    console.warn('Error fetching Firestore posts, falling back to API:', err);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      return data.posts || [];
    } catch (e) {
      return [];
    }
  }
};

/**
 * Get single post from Firestore
 */
export const getFirestorePostById = async (postId) => {
  try {
    if (!db) {
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();
      return data.post || null;
    }
    const postRef = doc(db, POSTS_COL, postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.warn('Error fetching Firestore post by ID:', err);
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();
      return data.post || null;
    } catch (e) {
      return null;
    }
  }
};

/**
 * Create a new Post in Firestore
 */
export const createFirestorePost = async (postData) => {
  try {
    if (!db) throw new Error('Firestore database is not connected');

    const payload = {
      ...postData,
      reactions: { fire: [], vibe: [postData.userId], heart: [], repeat: [], mindblown: [], overrated: [] },
      comments: [],
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, POSTS_COL), payload);
    const snap = await getDoc(docRef);

    // Also notify backend API silently
    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': postData.userId },
      body: JSON.stringify(payload)
    }).catch(() => {});

    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('Error creating Firestore post:', err);
    throw err;
  }
};

/**
 * Update an existing Post in Firestore
 */
export const updateFirestorePost = async (postId, updateData) => {
  try {
    if (!db) throw new Error('Firestore database is not connected');

    const postRef = doc(db, POSTS_COL, postId);
    await updateDoc(postRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    const snap = await getDoc(postRef);
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('Error updating Firestore post:', err);
    throw err;
  }
};

/**
 * Delete a Post from Firestore
 */
export const deleteFirestorePost = async (postId) => {
  try {
    if (!db) throw new Error('Firestore database is not connected');

    const postRef = doc(db, POSTS_COL, postId);
    await deleteDoc(postRef);
    return true;
  } catch (err) {
    console.error('Error deleting Firestore post:', err);
    throw err;
  }
};

/**
 * React to a Post in Firestore
 */
export const reactToFirestorePost = async (postId, reactionKey, userId) => {
  try {
    if (!db) throw new Error('Firestore database is not connected');

    const postRef = doc(db, POSTS_COL, postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) throw new Error('Post not found');

    const postData = snap.data();
    const reactions = postData.reactions || { fire: [], vibe: [], heart: [], repeat: [], mindblown: [], overrated: [] };
    const currentReactions = reactions[reactionKey] || [];

    const hasReacted = currentReactions.includes(userId);
    let updatedList;
    if (hasReacted) {
      updatedList = currentReactions.filter(id => id !== userId);
    } else {
      updatedList = [...currentReactions, userId];
    }

    reactions[reactionKey] = updatedList;
    await updateDoc(postRef, { reactions });

    return reactions;
  } catch (err) {
    console.error('Error reacting to Firestore post:', err);
    throw err;
  }
};

/**
 * Add Comment to a Post in Firestore
 */
export const addCommentToFirestorePost = async (postId, commentData) => {
  try {
    if (!db) throw new Error('Firestore database is not connected');

    const postRef = doc(db, POSTS_COL, postId);
    const newComment = {
      id: generateId('comm'),
      ...commentData,
      createdAt: new Date().toISOString()
    };

    await updateDoc(postRef, {
      comments: arrayUnion(newComment)
    });

    return newComment;
  } catch (err) {
    console.error('Error adding comment to Firestore post:', err);
    throw err;
  }
};
