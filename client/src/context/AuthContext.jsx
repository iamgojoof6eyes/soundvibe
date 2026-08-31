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
  const [user, setUser] = useState(null);
  const [activeUserId, setActiveUserId] = useState(localStorage.getItem('soundvibe_active_user_id') || 'user-1');
  const [allPersonas, setAllPersonas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all personas from database
  const fetchPersonas = async (preferredId = null) => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      const usersList = data.users || [];
      setAllPersonas(usersList);

      const targetId = preferredId || activeUserId;
      const matched = usersList.find(u => u.id === targetId) || usersList[0];
      if (matched) {
        setUser(matched);
        setActiveUserId(matched.id);
        localStorage.setItem('soundvibe_active_user_id', matched.id);
      }
    } catch (err) {
      console.error('Error loading personas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  // Switch persona instantly
  const switchDemoUser = (userId) => {
    const target = allPersonas.find(u => u.id === userId);
    if (target) {
      setUser(target);
      setActiveUserId(target.id);
      localStorage.setItem('soundvibe_active_user_id', target.id);
    }
  };

  // Create new profile on the fly (no login/password required)
  const createCustomPersona = async (profileData) => {
    try {
      const res = await fetch('/api/users/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setActiveUserId(data.user.id);
        localStorage.setItem('soundvibe_active_user_id', data.user.id);
        await fetchPersonas(data.user.id);
        return data.user;
      }
    } catch (err) {
      console.error('Error creating persona:', err);
      throw err;
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
        setAllPersonas(prev => prev.map(p => p.id === data.user.id ? data.user : p));
        return data.user;
      }
    } catch (err) {
      console.error('Profile update error:', err);
      throw err;
    }
  };

  // Toggle follow user
  const toggleFollowUser = async (targetUserId) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: 'POST',
        headers: { 'x-user-id': user.id }
      });
      const data = await res.json();

      setUser(prev => {
        if (!prev) return prev;
        const following = prev.following || [];
        const isFollowing = following.includes(targetUserId);
        return {
          ...prev,
          following: isFollowing
            ? following.filter(id => id !== targetUserId)
            : [...following, targetUserId]
        };
      });

      return data;
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const value = {
    user,
    token: null,
    loading,
    demoUsers: allPersonas,
    allPersonas,
    switchDemoUser,
    createCustomPersona,
    updateProfile,
    toggleFollowUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
