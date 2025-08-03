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
    
    // Verificar se Firebase está configurado corretamente
    if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      throw new Error('Firebase não está configurado corretamente. Verifique as variáveis de ambiente.');
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Login Google realizado com sucesso:", result.user.email);
    return result;
  } catch (error: any) {
    console.error("Erro no login Google:", error);
    
    // Verificar tipos específicos de erro
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      console.log("Popup bloqueado ou cancelado, tentando redirecionamento...");
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectError) {
        console.error("Erro no redirecionamento:", redirectError);
        throw redirectError;
      }
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('Domínio não autorizado no Firebase. Configure os domínios autorizados no console Firebase.');
    } else if (error.code === 'auth/internal-error') {
      throw new Error('Erro interno do Firebase. Verifique a configuração do projeto no console Firebase.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Erro de rede. Verifique sua conexão com a internet.');
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