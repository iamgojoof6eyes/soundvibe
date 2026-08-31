import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove,
  increment
} from 'firebase/firestore';

// Read configuration from Vite Environment Variables with safe project defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "***REMOVED***",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "soundvibe-c83d1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "soundvibe-c83d1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "soundvibe-c83d1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "15052980503",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:15052980503:web:a4bfd8d1cc89cfac823752",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-B73826SC5Q"
};

// Safe Firebase Initialization
let app;
let auth;
let db;
let googleProvider;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (err) {
  console.warn('Firebase initialization notice:', err);
}

export {
  app,
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
};

export default app;
