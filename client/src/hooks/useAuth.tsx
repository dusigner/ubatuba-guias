
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User as DbUser } from '@shared/schema';
import { toast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

// --- Tipos e Interfaces ---
interface AuthContextType {
  dbUser: DbUser | null;
  user: DbUser | null; // Alias para dbUser para consistência
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
  const syncAttemptedForUid = useRef<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  // Efeito para obter o estado do usuário do Firebase (diretamente)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsFirebaseLoading(false);
      // Quando o estado do Firebase Auth muda (e um usuário aparece/desaparece),
      // forçamos a invalidação do dbUser para re-avaliar a sessão do backend.
      queryClient.invalidateQueries({ queryKey: ['dbUser'] });
    });
    return () => unsubscribe();
  }, [queryClient]); // Dependência em queryClient para garantir que é estável

  // Query principal para buscar o usuário do nosso backend
  const { 
    data: dbUser, 
    isLoading: isLoadingDbUser,
    isFetching: isFetchingDbUser,
  } = useQuery<DbUser | null>({
    queryKey: ['dbUser'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/auth/user', 'GET');
        const data = await response.json();
        return data.user;
      } catch (e: any) {
        if (e.message.startsWith('401')) {
          return null;
        }
        throw e;
      }
    },
    enabled: !!firebaseUser && !isFirebaseLoading, 
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
  
  // Mutação para fazer o login (sincronizar com o backend)
  const { mutateAsync: login, isPending: isLoggingIn } = useMutation({
    mutationFn: (idToken: string) => apiRequest('/api/auth/firebase-login', 'POST', { idToken }),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['dbUser'] });
    },
    onError: (error) => {
      console.error("Erro na mutação de login:", error);
      toast({ variant: "destructive", title: "Erro de Login", description: "Não foi possível sincronizar a sessão." });
      // Removido auth.signOut() daqui para evitar loop. O useEffect lida com falhas de sincronização.
    },
  });

  // Efeito para sincronizar a sessão do backend de forma segura
  useEffect(() => {
    const isUserLoggedInFirebase = !!firebaseUser;
    const isUserLoggedInBackend = !!dbUser;

    // Se o Firebase diz que estamos logados, mas o backend não tem sessão,
    // E a query do dbUser não está em progresso ou carregando (para evitar corrida),
    // E o login via mutação não está em progresso,
    // E a sincronização ainda não foi tentada para este UID.
    if (
      isUserLoggedInFirebase && 
      !isUserLoggedInBackend && 
      !isFetchingDbUser && 
      !isLoadingDbUser && 
      !isLoggingIn &&
      firebaseUser.uid && 
      syncAttemptedForUid.current !== firebaseUser.uid
    ) {
      console.log(`Auth Sync: Initializing sync for UID: ${firebaseUser.uid}`);
      syncAttemptedForUid.current = firebaseUser.uid; // Marca este UID como tentativa de sincronização
      
      const syncSession = async () => {
        try {
          const idToken = await firebaseUser.getIdToken(true); // Força token atualizado
          await login(idToken); // Chama a mutação de login
          console.log("Auth Sync: Sincronização bem-sucedida.");
        } catch (error) {
          console.error("Auth Sync: Sync failed. Signing out to prevent loop.", error);
          auth.signOut(); // Desloga do Firebase em caso de falha de sincronização para quebrar o ciclo
        }
      };
      syncSession();
    }

    // Resetar a trava se o usuário do Firebase sumir
    if (!isUserLoggedInFirebase && syncAttemptedForUid.current) {
        syncAttemptedForUid.current = null;
    }
  }, [firebaseUser, dbUser, isLoadingDbUser, isFetchingDbUser, isLoggingIn, login, queryClient]);

  // Mutação para fazer o logout
  const { mutateAsync: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/auth/logout', 'POST');
      await auth.signOut();
    },
    onSuccess: () => {
      queryClient.setQueryData(['dbUser'], null);
      setFirebaseUser(null); 
      queryClient.removeQueries();
    },
    onError: (error) => console.error("Erro no logout:", error),
  });
  
  // --- Estados Derivados ---
  const isLoading = isFirebaseLoading || isLoadingDbUser || isFetchingDbUser || (!!firebaseUser && !dbUser && !isLoggingIn); 
  const isProfileComplete = dbUser?.isProfileComplete ?? false;
  const isAuthenticated = !!dbUser && isProfileComplete;
  const isAdmin = dbUser?.isAdmin ?? false;
  const isGuide = dbUser?.userType === 'guide';
  const isOperator = dbUser?.userType === 'boat_tour_operator';

  const value = useMemo(() => ({
    dbUser: dbUser ?? null,
    user: dbUser ?? null,
    isLoading,
    isAuthenticated,
    isProfileComplete,
    isAdmin,
    isGuide,
    isOperator,
    login,
    logout,
    isLoggingIn,
    isLoggingOut,
  }), [dbUser, isLoading, isAuthenticated, isProfileComplete, isAdmin, isGuide, isOperator, login, logout, isLoggingIn, isLoggingOut]);

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
