import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, handleRedirectResult } from '@/lib/firebase';
import type { User as AppUser } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get app user data from backend when Firebase user exists
  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: !!firebaseUser,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      if (response.status === 401) {
        console.log('Backend session not found, will sync with Firebase user');
        return null;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    }
  }) as { data: AppUser | null, refetch: () => void };

  useEffect(() => {
    console.log('AuthProvider inicializando...');
    
    // Handle redirect result on page load (only check, don't rely on it for popup flow)
    handleRedirectResult()
      .then(async (result) => {
        console.log('Resultado do redirect:', result);
        if (result?.user) {
          console.log('Usuário retornou do redirect:', result.user.email);
          await syncUserWithBackend(result.user);
          refetchUser();
        }
      })
      .catch((error) => {
        console.log('Nenhum redirect result disponível (normal para popup flow)');
      });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      console.log('Estado de autenticação mudou:', firebaseUser ? firebaseUser.email : 'null');
      setFirebaseUser(firebaseUser);
      
      // Only sync if we have a Firebase user but no backend user data
      // and we're not in the middle of updating user data
      if (firebaseUser && !user) {
        console.log('Firebase user found but no backend session, syncing...');
        syncUserWithBackend(firebaseUser);
      } else if (!firebaseUser) {
        console.log('Firebase user logged out');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncUserWithBackend = async (firebaseUser: User) => {
    try {
      console.log('Iniciando sincronização com backend para:', firebaseUser.email);
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Send to backend to create/update user session
      const response = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync user with backend');
      }

      // After successful login, get user data
      const userData = await response.json();
      console.log('Usuário sincronizado:', userData);
      
      // Force refresh user data to update the UI
      refetchUser();
      
      console.log('Sincronização completa. AuthProvider deve gerenciar redirecionamento.');
    } catch (error) {
      console.error('Erro na sincronização com backend:', error);
    }
  };

  const signOut = async () => {
    try {
      console.log('Fazendo logout...');
      
      // Logout from backend session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Logout from Firebase
      const { signOutUser } = await import('@/lib/firebase');
      await signOutUser();
      console.log('Logout realizado com sucesso');
      
      // Refresh user data
      refetchUser();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    isLoading: loading,
    isAuthenticated: !!user,
    signOut,
    refetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}