const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialSeedData = {
  users: [],
  posts: [],
  comments: []
};

// Database in-memory + file persistence
class Database {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error loading db.json, recreating from seed:', err);
        this.data = JSON.parse(JSON.stringify(initialSeedData));
        this.save();
      }
    } else {
      this.data = JSON.parse(JSON.stringify(initialSeedData));
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  // Users
  getUsers() {
    return this.data.users.map(u => {
      const { passwordHash, ...safeUser } = u;
      return safeUser;
    });
  }

  getUserById(id) {
    const user = this.data.users.find(u => u.id === id || u.username === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  getUserByUsername(username) {
    if (!username) return null;
    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '').trim();
    const user = this.data.users.find(u => u.username === clean || u.id === `user-${clean}`);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  getOrCreateUserByUsername({ username, name, avatar, bio, favoriteGenres }) {
    if (!username || !username.trim()) {
      username = 'listener_' + Math.random().toString(36).substring(2, 6);
    }
    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '').trim();
    let user = this.data.users.find(u => u.username === clean || u.id === `user-${clean}`);

    if (user) {
      if (name && name.trim()) user.name = name.trim();
      if (avatar && avatar.trim()) user.avatar = avatar.trim();
      if (bio && bio.trim()) user.bio = bio.trim();
      this.save();
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    }

    const newUser = {
      id: `user-${clean}`,
      username: clean,
      email: `${clean}@soundvibe.io`,
      name: name && name.trim() ? name.trim() : clean,
      avatar: avatar && avatar.trim() ? avatar.trim() : `https://api.dicebear.com/7.x/bottts/svg?seed=${clean}`,
      bio: bio && bio.trim() ? bio.trim() : 'Music enthusiast sharing sonic vibes on SoundVibe 🎧',
      passwordHash: '',
      favoriteGenres: favoriteGenres || ['Indie Rock', 'Electronic'],
      topTracks: [],
      badges: ['Vibe Explorer'],
      following: [],
      followers: [],
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  getUserWithPasswordByEmailOrUsername(identifier) {
    const clean = identifier.toLowerCase().trim();
    return this.data.users.find(u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean);
  }

  createUser({ username, email, password, name, avatar, bio, favoriteGenres, topTracks }) {
    const existing = this.getUserWithPasswordByEmailOrUsername(email) || this.getUserWithPasswordByEmailOrUsername(username);
    if (existing) {
      throw new Error('User with this email or username already exists');
    }

    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email: email.toLowerCase(),
      name: name || username,
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      bio: bio || 'Music enthusiast sharing sonic vibes on SoundVibe 🎵',
      passwordHash: bcrypt.hashSync(password, 10),
      favoriteGenres: favoriteGenres || ['Indie', 'Alternative', 'Electronic'],
      topTracks: topTracks || [],
      badges: ['New Listener', 'Vibe Explorer'],
      following: ['user-1'],
      followers: [],
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.save();

    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  updateUserProfile(userId, { name, bio, avatar, favoriteGenres, topTracks }) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (favoriteGenres !== undefined) user.favoriteGenres = favoriteGenres;
    if (topTracks !== undefined) user.topTracks = topTracks;

    this.save();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  toggleFollow(currentUserId, targetUserId) {
    if (!currentUserId || !targetUserId) throw new Error('Both user handles are required');
    const cleanCurrent = currentUserId.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanTarget = targetUserId.toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (cleanCurrent === cleanTarget) throw new Error('Cannot follow yourself');

    let currentUser = this.data.users.find(u => u.id === currentUserId || u.id === `user-${cleanCurrent}` || u.username === cleanCurrent);
    let targetUser = this.data.users.find(u => u.id === targetUserId || u.id === `user-${cleanTarget}` || u.username === cleanTarget);

    if (!currentUser) {
      currentUser = this.getOrCreateUserByUsername({ username: cleanCurrent });
    }
    if (!targetUser) {
      targetUser = this.getOrCreateUserByUsername({ username: cleanTarget });
    }

    currentUser.following = currentUser.following || [];
    targetUser.followers = targetUser.followers || [];

    const isFollowing = currentUser.following.includes(targetUser.id) || currentUser.following.includes(targetUser.username);
    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id !== targetUser.id && id !== targetUser.username);
      targetUser.followers = targetUser.followers.filter(id => id !== currentUser.id && id !== currentUser.username);
    } else {
      currentUser.following.push(targetUser.id);
      targetUser.followers.push(currentUser.id);
    }

    this.save();
    return {
      isFollowing: !isFollowing,
      followerCount: targetUser.followers.length,
      following: currentUser.following
    };
  }

  // Posts
  getPosts({ filter = 'all', genre = null, currentUserId = null, userId = null } = {}) {
    let list = [...this.data.posts];

    if (userId) {
      const cleanUid = userId.toLowerCase().replace(/[^a-z0-9_]/g, '');
      list = list.filter(p => p.userId === userId || p.userId === `user-${cleanUid}` || p.userId === cleanUid);
    }

    if (filter === 'following') {
      if (!currentUserId) {
        return [];
      }
      const cleanCurrent = currentUserId.toLowerCase().replace(/[^a-z0-9_]/g, '');
      const user = this.data.users.find(u => u.id === currentUserId || u.id === `user-${cleanCurrent}` || u.username === cleanCurrent);
      const followingList = user ? (user.following || []) : [];

      list = list.filter(p => {
        const pUid = (p.userId || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
        return followingList.some(fId => {
          const cleanF = fId.toLowerCase().replace(/[^a-z0-9_]/g, '');
          return pUid === cleanF || p.userId === fId;
        }) || pUid === cleanCurrent;
      });
    } else if (filter === 'top-rated') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (filter === 'trending') {
      list.sort((a, b) => {
        const totalA = Object.values(a.reactions || {}).flat().length;
        const totalB = Object.values(b.reactions || {}).flat().length;
        return totalB - totalA;
      });
    } else {
      // Default: recent
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (genre && genre !== 'All') {
      const gLower = genre.toLowerCase();
      list = list.filter(p => {
        const postGenre = p.track.genre ? p.track.genre.toLowerCase() : '';
        const tags = (p.vibeTags || []).map(t => t.toLowerCase());
        return postGenre.includes(gLower) || tags.some(t => t.includes(gLower));
      });
    }

    // Attach author and comment counts
    return list.map(p => {
      const author = this.getUserById(p.userId);
      const postComments = this.data.comments.filter(c => c.postId === p.id);
      return {
        ...p,
        author,
        commentsCount: postComments.length
      };
    });
  }

  getPostById(postId) {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) return null;
    const author = this.getUserById(post.userId);
    const postComments = this.getComments(postId);
    return {
      ...post,
      author,
      comments: postComments
    };
  }

  createPost({ userId, track, rating, headline, review, favoriteLyric, vibeTags, mood }) {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const newPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      track,
      rating: parseFloat(rating) || 5,
      headline: headline || `${track.title} by ${track.artist}`,
      review: review || '',
      favoriteLyric: favoriteLyric || '',
      vibeTags: Array.isArray(vibeTags) ? vibeTags : (vibeTags ? vibeTags.split(',').map(t => t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`) : []),
      mood: mood || 'Vibing',
      reactions: {
        fire: [],
        vibe: [userId],
        heart: [],
        repeat: [],
        mindblown: [],
        overrated: []
      },
      createdAt: new Date().toISOString()
    };

    this.data.posts.unshift(newPost);
    this.save();

    return {
      ...newPost,
      author: user,
      commentsCount: 0
    };
  }

  toggleReaction(postId, userId, reactionType) {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    if (!post.reactions) {
      post.reactions = { fire: [], vibe: [], heart: [], repeat: [], mindblown: [], overrated: [] };
    }

    if (!post.reactions[reactionType]) {
      post.reactions[reactionType] = [];
    }

    const currentArray = post.reactions[reactionType];
    const index = currentArray.indexOf(userId);

    if (index > -1) {
      currentArray.splice(index, 1);
    } else {
      currentArray.push(userId);
    }

    this.save();
    return post.reactions;
  }

  // Comments
  getComments(postId) {
    const comments = this.data.comments.filter(c => c.postId === postId);
    return comments.map(c => ({
      ...c,
      author: this.getUserById(c.userId)
    })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  addComment(postId, userId, text) {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const newComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      postId,
      userId,
      text,
      likes: [],
      createdAt: new Date().toISOString()
    };

    this.data.comments.push(newComment);
    this.save();

    return {
      ...newComment,
      author: user
    };
  }

  toggleCommentLike(commentId, userId) {
    const comment = this.data.comments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');

    comment.likes = comment.likes || [];
    const index = comment.likes.indexOf(userId);
    if (index > -1) {
      comment.likes.splice(index, 1);
    } else {
      comment.likes.push(userId);
    }

    this.save();
    return { likes: comment.likes };
  }

  // Taste Compatibility Matching
  calculateTasteMatch(user1Id, user2Id) {
    const u1 = this.getUserById(user1Id);
    const u2 = this.getUserById(user2Id);
    if (!u1 || !u2) return null;

    const g1 = (u1.favoriteGenres || []).map(g => g.toLowerCase());
    const g2 = (u2.favoriteGenres || []).map(g => g.toLowerCase());

    const sharedGenres = g1.filter(g => g2.includes(g));
    const genreScore = (sharedGenres.length / Math.max(1, Math.max(g1.length, g2.length))) * 60;

    // Check shared post interactions (likes/reactions)
    const user1ReactedPosts = this.data.posts.filter(p => Object.values(p.reactions || {}).some(arr => arr.includes(user1Id))).map(p => p.id);
    const user2ReactedPosts = this.data.posts.filter(p => Object.values(p.reactions || {}).some(arr => arr.includes(user2Id))).map(p => p.id);

    const sharedLikedPosts = user1ReactedPosts.filter(id => user2ReactedPosts.includes(id));
    const socialScore = Math.min(30, sharedLikedPosts.length * 10);

    const baseChemistry = 15; // baseline interest
    const totalMatchPercentage = Math.min(99, Math.max(25, Math.round(genreScore + socialScore + baseChemistry)));

    let matchTier = 'Sonic Soulmates';
    let description = 'Incredible resonance! You both share core musical DNA and frequency.';
    if (totalMatchPercentage < 50) {
      matchTier = 'Genre Explorers';
      description = 'Different musical worlds—perfect for expanding each other’s horizons and discovering new sounds!';
    } else if (totalMatchPercentage < 80) {
      matchTier = 'Vibe Companions';
      description = 'Great overlap in taste! You will love each other’s playlists and recommendations.';
    }

    return {
      matchPercentage: totalMatchPercentage,
      tier: matchTier,
      description,
      sharedGenres: u1.favoriteGenres.filter(g => (u2.favoriteGenres || []).some(g2 => g2.toLowerCase() === g.toLowerCase())),
      user1: u1,
      user2: u2
    };
  }

  // Lounges
  getLounges() {
    return this.data.lounges;
  }

  getLoungeById(id) {
    return this.data.lounges.find(l => l.id === id);
  }

  addLoungeMessage(loungeId, userId, text) {
    const lounge = this.getLoungeById(loungeId);
    if (!lounge) throw new Error('Lounge not found');
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const msg = {
      id: `m-${Date.now()}`,
      userId,
      name: user.name,
      avatar: user.avatar,
      text,
      timestamp: timeStr
    };

    lounge.messages = lounge.messages || [];
    lounge.messages.push(msg);
    if (lounge.messages.length > 50) {
      lounge.messages.shift();
    }
    this.save();
    return msg;
  }

  addLoungeTrack(loungeId, track, userId) {
    const lounge = this.getLoungeById(loungeId);
    if (!lounge) throw new Error('Lounge not found');
    const user = this.getUserById(userId);

    const queueItem = {
      id: `q-${Date.now()}`,
      ...track,
      votes: 1,
      voters: [userId],
      suggestedBy: user ? user.name : 'Anonymous'
    };

    lounge.queue = lounge.queue || [];
    lounge.queue.push(queueItem);
    this.save();
    return queueItem;
  }

  voteLoungeTrack(loungeId, queueItemId, userId) {
    const lounge = this.getLoungeById(loungeId);
    if (!lounge) throw new Error('Lounge not found');

    const item = (lounge.queue || []).find(q => q.id === queueItemId);
    if (!item) throw new Error('Queue item not found');

    item.voters = item.voters || [];
    const index = item.voters.indexOf(userId);
    if (index > -1) {
      item.voters.splice(index, 1);
      item.votes = Math.max(0, item.votes - 1);
    } else {
      item.voters.push(userId);
      item.votes = (item.votes || 0) + 1;
    }

    // Sort queue by votes
    lounge.queue.sort((a, b) => b.votes - a.votes);
    this.save();
    return lounge.queue;
  }
}

module.exports = new Database();
