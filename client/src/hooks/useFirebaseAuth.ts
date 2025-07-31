import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, handleRedirectResult } from '@/lib/firebase';

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      setUser(firebaseUser);
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

  return {
    firebaseUser: user,
    loading,
    signOut
  };
}