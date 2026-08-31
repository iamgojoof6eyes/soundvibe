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
    console.warn('Firestore get user fallback:', err);
    return null;
  }
};

/**
 * Save or update user profile in Firestore
 */
export const saveFirestoreUser = async (uid, userData) => {
  if (!uid) return null;
  try {
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
    // Find target user
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
      // Unfollow
      await updateDoc(currentUserRef, {
        following: arrayRemove(targetUid, targetUser.username)
      });
      await updateDoc(targetUserRef, {
        followers: arrayRemove(currentUid, currentUserData.username)
      });
    } else {
      // Follow
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
 * Fetch posts from Firestore with sorting & filtering
 */
export const getFirestorePosts = async ({ filter, genre, userId, currentUserId } = {}) => {
  try {
    let q = collection(db, POSTS_COL);
    const snap = await getDocs(q);

    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Filter by genre
    if (genre && genre !== 'All') {
      list = list.filter(p => 
        (p.track?.genre?.toLowerCase() === genre.toLowerCase()) ||
        (p.vibeTags || []).some(t => t.toLowerCase().includes(genre.toLowerCase()))
      );
    }

    // Filter by specific user
    if (userId) {
      list = list.filter(p => p.userId === userId || p.author?.username === userId);
    }

    // Filter following
    if (filter === 'following' && currentUserId) {
      const currentUser = await getFirestoreUser(currentUserId);
      const followingList = currentUser?.following || [];
      list = list.filter(p => followingList.includes(p.userId) || followingList.includes(p.author?.username));
    }

    // Sort
    if (filter === 'trending') {
      list.sort((a, b) => {
        const reactionsA = Object.values(a.reactions || {}).reduce((acc, curr) => acc + (curr?.length || 0), 0);
        const reactionsB = Object.values(b.reactions || {}).reduce((acc, curr) => acc + (curr?.length || 0), 0);
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
    console.warn('Error fetching Firestore posts:', err);
    return [];
  }
};

/**
 * Create a new Post in Firestore
 */
export const createFirestorePost = async (postData) => {
  try {
    const payload = {
      ...postData,
      reactions: { fire: [], heart: [], mindblown: [], chill: [] },
      comments: [],
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, POSTS_COL), payload);
    const snap = await getDoc(docRef);
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
    const postRef = doc(db, POSTS_COL, postId);
    await deleteDoc(postRef);
    return true;
  } catch (err) {
    console.error('Error deleting Firestore post:', err);
    throw err;
  }
};

/**
 * React to a Post
 */
export const reactToFirestorePost = async (postId, reactionKey, userId) => {
  try {
    const postRef = doc(db, POSTS_COL, postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) throw new Error('Post not found');

    const postData = snap.data();
    const reactions = postData.reactions || { fire: [], heart: [], mindblown: [], chill: [] };
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
 * Add Comment to a Post
 */
export const addCommentToFirestorePost = async (postId, commentData) => {
  try {
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
