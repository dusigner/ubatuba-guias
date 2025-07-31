import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ubatuba-guias.firebaseapp.com",
  projectId: "ubatuba-guias",
  storageBucket: "ubatuba-guias.firebasestorage.app",
  messagingSenderId: "1063851833654",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-6MHBRY7G3K"
};

// Initialize Firebase
import { getApp, getApps } from 'firebase/app';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth functions
export const signInWithGoogle = () => {
  return signInWithRedirect(auth, googleProvider);
};

export const handleRedirectResult = () => {
  return getRedirectResult(auth);
};

export const signOutUser = () => {
  return signOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { GoogleAuthProvider };