
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User as DbUser } from '@shared/schema';
import { toast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

// --- Tipos e Interfaces ---
interface AuthContextType {
  user: DbUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isAdmin: boolean;
  isGuide: boolean;
  isOperator: boolean;
  login: (idToken: string) => Promise<any>;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
}

// --- Contexto ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Componente Provedor ---
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(() => auth.currentUser);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  // Efeito para monitorar o estado do Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsFirebaseLoading(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    });
    return () => unsubscribe();
  }, [queryClient]);

  // Query principal para buscar o usuário do nosso backend
  const { data: user, isLoading: isUserLoading, isFetching: isUserFetching } = useQuery<DbUser | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const data = await apiRequest<{ user: DbUser }>('/api/auth/user', 'GET');
        return data.user;
      } catch (error: any) {
        if (error.message.includes('Not authenticated') || error.message.includes('Unauthorized')) {
          return null;
        }
        throw error;
      }
    },
    // --- CORREÇÃO APLICADA AQUI ---
    // Só executa esta query se o Firebase terminou de carregar E encontrou um usuário.
    // Isso previne a chamada da API para usuários não logados.
    enabled: !isFirebaseLoading && !!firebaseUser,
    staleTime: 30 * 60 * 1000,
    retry: false,
  });

  // Mutação para fazer o login (sincronizar com o backend)
  const { mutateAsync: login, isPending: isLoggingIn } = useMutation({
    mutationFn: (idToken: string) => apiRequest('/api/auth/firebase-login', 'POST', { idToken }),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error("Erro na mutação de login:", error);
      toast({ variant: "destructive", title: "Erro de Login", description: "Não foi possível criar sua sessão." });
    },
  });

  // Efeito para sincronizar a sessão do backend
  useEffect(() => {
    if (firebaseUser && !user && !isUserLoading && !isUserFetching && !isLoggingIn) {
      const syncSession = async () => {
        try {
          console.log(`Auth Sync: Iniciando sincronização para UID: ${firebaseUser.uid}`);
          const idToken = await firebaseUser.getIdToken();
          await login(idToken);
          console.log("Auth Sync: Sincronização bem-sucedida.");
        } catch (error) {
          console.error("Auth Sync: Falha na sincronização. Deslogando para evitar loop.", error);
          await auth.signOut();
        }
      };
      syncSession();
    }
  }, [firebaseUser, user, isUserLoading, isUserFetching, isLoggingIn, login]);

  // Mutação para fazer o logout
  const { mutateAsync: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/auth/logout', 'POST');
      await auth.signOut();
    },
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Erro no logout:", error);
      auth.signOut();
      queryClient.clear();
    },
  });
  
  // --- Estados Derivados ---
  const isLoading = isFirebaseLoading || (!!firebaseUser && (isUserLoading || isUserFetching));
  const isProfileComplete = user?.isProfileComplete ?? false;
  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin ?? false;
  const isGuide = user?.userType === 'guide';
  const isOperator = user?.userType === 'boat_tour_operator';

  console.log('useAuth-user', user)
  console.log('useAuth-!!user', !!user)
  console.log('useAuth-isLoading', isLoading)
  console.log('useAuth-isAuthenticated', isAuthenticated)
  console.log('useAuth-isProfileComplete', isProfileComplete)

  const value = useMemo(() => ({
    user: user ?? null,
    isLoading,
    isAuthenticated,
    isProfileComplete,
    isAdmin,
    isGuide,
    isOperator,
    login,
    logout,
    isLoggingIn,
    isLoggingOut
  }), [user, isLoading, isAuthenticated, isProfileComplete, isAdmin, isGuide, isOperator, login, logout, isLoggingIn, isLoggingOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Hook Customizado ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthProvider;
