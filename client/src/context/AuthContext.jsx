import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('soundvibe_user_identity');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Lookup user by username / unique ID
  const lookupUserByUsername = async (rawUsername) => {
    if (!rawUsername || !rawUsername.trim()) return null;
    const clean = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, '').trim();
    try {
      const res = await fetch(`/api/users/lookup/${clean}`);
      const data = await res.json();
      if (data.exists && data.user) {
        return data.user;
      }
      return null;
    } catch (err) {
      console.error('Error looking up user:', err);
      return null;
    }
  };

  // Save / Update user identity locally & on backend
  const saveUserIdentity = async ({ username, name, avatar, bio, favoriteGenres }) => {
    if (!username || !username.trim()) return null;
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '').trim();
    const cleanName = name && name.trim() ? name.trim() : cleanUsername;
    const cleanAvatar = avatar && avatar.trim() ? avatar.trim() : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`;

    const profile = {
      id: `user-${cleanUsername}`,
      username: cleanUsername,
      name: cleanName,
      avatar: cleanAvatar,
      bio: bio && bio.trim() ? bio.trim() : 'Music enthusiast sharing sonic vibes on SoundVibe 🎧',
      favoriteGenres: favoriteGenres || ['Indie Rock', 'Electronic']
    };

    try {
      const res = await fetch('/api/users/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      const finalUser = data.user || profile;

      setUser(finalUser);
      localStorage.setItem('soundvibe_user_identity', JSON.stringify(finalUser));
      return finalUser;
    } catch (err) {
      console.error('Error saving user profile:', err);
      setUser(profile);
      localStorage.setItem('soundvibe_user_identity', JSON.stringify(profile));
      return profile;
    }
  };

  // Update profile
  const updateProfile = async (updatedFields) => {
    if (!user) return;
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('soundvibe_user_identity', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.error('Profile update error:', err);
      throw err;
    }
  };

  // Clear local identity
  const clearUserIdentity = () => {
    localStorage.removeItem('soundvibe_user_identity');
    setUser(null);
  };

  // Follow user
  const toggleFollowUser = async (targetUserId) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: 'POST',
        headers: { 'x-user-id': user.id || user.username }
      });
      const data = await res.json();

      if (data.following) {
        setUser(prev => {
          if (!prev) return prev;
          const updated = { ...prev, following: data.following };
          localStorage.setItem('soundvibe_user_identity', JSON.stringify(updated));
          return updated;
        });
      }

      return data;
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const value = {
    user,
    loading,
    lookupUserByUsername,
    saveUserIdentity,
    updateProfile,
    clearUserIdentity,
    toggleFollowUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
