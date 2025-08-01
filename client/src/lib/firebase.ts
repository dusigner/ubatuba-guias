import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";

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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Auth functions
export const signInWithGoogle = async () => {
  try {
    console.log("Tentando login Google via popup...");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Login Google realizado com sucesso:", result.user.email);
    return result;
  } catch (error: any) {
    console.error("Erro no login Google:", error);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      console.log("Popup bloqueado ou cancelado, redirecionando para login...");
      
      // Mostrar mensagem para o usuário antes do redirecionamento
      const userConfirmed = window.confirm(
        "O popup foi bloqueado pelo seu navegador. Clique em OK para ser redirecionado para fazer login com Google."
      );
      
      if (userConfirmed) {
        await signInWithRedirect(auth, googleProvider);
      }
      return null;
    } else {
      throw error;
    }
  }
};

export const signInWithGoogleRedirect = () => {
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