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

// Initialize Firebase with better error handling
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log('Firebase app inicializado com sucesso');
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
  throw error;
}

export const auth = getAuth(app);

// Set auth language to Portuguese
auth.languageCode = 'pt';

// Google Auth Provider with custom parameters
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Keep provider simple to avoid auth/internal-error
// googleProvider.setCustomParameters({
//   'login_hint': 'user@example.com'
// });

// Auth functions
export const signInWithGoogle = async () => {
  try {
    console.log("Tentando login Google via popup...");
    
    // Verificar se Firebase está configurado corretamente
    if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_APP_ID) {
      console.error('Configuração Firebase:', {
        apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
        appId: !!import.meta.env.VITE_FIREBASE_APP_ID
      });
      throw new Error('Firebase não está configurado corretamente. Verifique as variáveis de ambiente.');
    }
    
    // Verificar se o auth está inicializado
    if (!auth || !auth.app) {
      throw new Error('Firebase Auth não está inicializado corretamente.');
    }
    
    // Log da configuração (sem expor secrets)
    console.log('Firebase configurado com projeto: ubatuba-guias');
    console.log('Domínio atual:', window.location.hostname);
    console.log('Auth Domain:', firebaseConfig.authDomain);
    console.log('Firebase App Name:', auth.app.name);
    console.log('Firebase Auth configurado:', !!auth);
    
    // Try to clear any existing auth state first
    console.log('Estado atual do auth antes do login:', {
      currentUser: auth.currentUser?.email || 'nenhum',
      isSignedIn: !!auth.currentUser
    });
    
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