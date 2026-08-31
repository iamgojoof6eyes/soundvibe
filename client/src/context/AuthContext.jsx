import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from '../firebase';
import { 
  getFirestoreUser, 
  saveFirestoreUser, 
  toggleFollowFirestore 
} from '../services/firestoreService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('soundvibe_user_identity');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Helper to sync user profile with local storage & backend
  const persistUser = (userData) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem('soundvibe_user_identity', JSON.stringify(userData));
      // Also silently sync with backend for server APIs
      fetch('/api/users/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }).catch(err => console.warn('Silent backend persona sync:', err));
    } else {
      setUser(null);
      localStorage.removeItem('soundvibe_user_identity');
    }
  };

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          // Look up Firestore profile
          let profile = await getFirestoreUser(fbUser.uid);
          if (!profile) {
            // Generate clean username from email or name
            const rawName = fbUser.displayName || 'Music Listener';
            const baseHandle = (fbUser.email ? fbUser.email.split('@')[0] : rawName)
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '');
            const cleanHandle = baseHandle || `user_${fbUser.uid.substring(0, 6)}`;

            const initialProfile = {
              id: fbUser.uid,
              uid: fbUser.uid,
              email: fbUser.email,
              name: rawName,
              username: cleanHandle,
              avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}`,
              bio: 'Music enthusiast sharing sonic vibes on SoundVibe 🎧',
              favoriteGenres: ['Indie Rock', 'Electronic'],
              followers: [],
              following: [],
              topTracks: [],
              badges: ['Curator']
            };

            profile = await saveFirestoreUser(fbUser.uid, initialProfile);
          }

          persistUser(profile);
        } catch (err) {
          console.error('Error fetching Firestore user profile:', err);
        }
      } else {
        // Logged out
        setUser(null);
        localStorage.removeItem('soundvibe_user_identity');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Sign In with Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      let profile = await getFirestoreUser(fbUser.uid);
      if (!profile) {
        const rawName = fbUser.displayName || 'Music Listener';
        const cleanHandle = (fbUser.email ? fbUser.email.split('@')[0] : rawName)
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '');

        const newProfile = {
          id: fbUser.uid,
          uid: fbUser.uid,
          email: fbUser.email,
          name: rawName,
          username: cleanHandle || `user_${fbUser.uid.substring(0, 6)}`,
          avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}`,
          bio: 'Music enthusiast sharing sonic vibes on SoundVibe 🎧',
          favoriteGenres: ['Indie Rock', 'Electronic'],
          followers: [],
          following: [],
          topTracks: [],
          badges: ['Curator']
        };
        profile = await saveFirestoreUser(fbUser.uid, newProfile);
      }

      persistUser(profile);
      setAuthModalOpen(false);
      return profile;
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  };

  // 2. Sign In with Email & Password
  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = result.user;
      let profile = await getFirestoreUser(fbUser.uid);
      persistUser(profile);
      setAuthModalOpen(false);
      return profile;
    } catch (err) {
      console.error('Email Sign-In Error:', err);
      throw err;
    }
  };

  // 3. Sign Up with Email & Password
  const registerWithEmail = async (email, password, displayName, rawUsername) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = result.user;

      const cleanHandle = (rawUsername || (email ? email.split('@')[0] : 'listener'))
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '');

      const cleanName = displayName || cleanHandle;
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}`;

      // Update Firebase Auth Profile
      await updateFirebaseProfile(fbUser, {
        displayName: cleanName,
        photoURL: avatarUrl
      });

      const newProfile = {
        id: fbUser.uid,
        uid: fbUser.uid,
        email: fbUser.email,
        name: cleanName,
        username: cleanHandle,
        avatar: avatarUrl,
        bio: 'Music enthusiast sharing sonic vibes on SoundVibe 🎧',
        favoriteGenres: ['Indie Rock', 'Electronic'],
        followers: [],
        following: [],
        topTracks: [],
        badges: ['Curator']
      };

      const saved = await saveFirestoreUser(fbUser.uid, newProfile);
      persistUser(saved || newProfile);
      setAuthModalOpen(false);
      return saved || newProfile;
    } catch (err) {
      console.error('Email Sign-Up Error:', err);
      throw err;
    }
  };

  // 4. Logout
  const logout = async () => {
    try {
      await signOut(auth);
      persistUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 5. Update Profile
  const updateUserProfile = async (updatedFields) => {
    if (!user) return;
    try {
      const uid = firebaseUser?.uid || user.id;
      const updated = await saveFirestoreUser(uid, {
        ...user,
        ...updatedFields
      });
      const finalUser = updated || { ...user, ...updatedFields };
      persistUser(finalUser);
      return finalUser;
    } catch (err) {
      console.error('Profile update error:', err);
      throw err;
    }
  };

  // 6. Toggle Follow
  const toggleFollowUser = async (targetUserIdOrUsername) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const currentUid = firebaseUser?.uid || user.id;
      const result = await toggleFollowFirestore(currentUid, targetUserIdOrUsername);
      if (result) {
        setUser(prev => {
          if (!prev) return prev;
          const next = { ...prev, following: result.following };
          localStorage.setItem('soundvibe_user_identity', JSON.stringify(next));
          return next;
        });
      }
      return result;
    } catch (err) {
      console.error('Follow error:', err);
      // Fallback to backend API
      try {
        const res = await fetch(`/api/users/${targetUserIdOrUsername}/follow`, {
          method: 'POST',
          headers: { 'x-user-id': user.id || user.username }
        });
        return await res.json();
      } catch (e) {}
    }
  };

  // Backward compatibility alias
  const clearUserIdentity = logout;
  const lookupUserByUsername = async (username) => getFirestoreUser(username);
  const saveUserIdentity = async (data) => updateUserProfile(data);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        authModalOpen,
        setAuthModalOpen,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        clearUserIdentity,
        updateProfile: updateUserProfile,
        updateUserProfile,
        saveUserIdentity,
        lookupUserByUsername,
        toggleFollowUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
