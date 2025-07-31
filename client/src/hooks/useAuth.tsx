import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, handleRedirectResult } from '@/lib/firebase';
import type { User as AppUser } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
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
    queryFn: async () => {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      if (response.status === 401) {
        return null;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    }
  }) as { data: AppUser | null, refetch: () => void };

  useEffect(() => {
    // Handle redirect result on page load
    handleRedirectResult()
      .then((result) => {
        if (result?.user) {
          // User just signed in, sync with backend
          syncUserWithBackend(result.user);
        }
      })
      .catch((error) => {
        console.error('Error handling redirect result:', error);
      });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        syncUserWithBackend(firebaseUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncUserWithBackend = async (firebaseUser: User) => {
    try {
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Send to backend to create/update user session
      const response = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
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

      // After successful login, get user data and redirect
      const userData = await response.json();
      
      // Redirect based on profile completion
      setTimeout(() => {
        if (userData.isProfileComplete) {
          window.location.href = '/home';
        } else {
          window.location.href = '/profile-selection';
        }
      }, 1000);
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    }
  };

  const signOut = async () => {
    try {
      const { signOutUser } = await import('@/lib/firebase');
      await signOutUser();
      // Also clear backend session
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signOut
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