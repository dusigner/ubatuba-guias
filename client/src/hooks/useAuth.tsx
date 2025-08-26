import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User as DbUser } from '@shared/schema';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '../hooks/use-toast';

// Interface do Contexto de Autenticação
interface AuthContextType {
  firebaseUser: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuide: boolean;
  isOperator: boolean;
  isProfileComplete: boolean;
  logout: () => Promise<void>;
  refreshDbUser: () => Promise<void>;
  user: DbUser | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  // Novo estado para rastrear a verificação inicial do Firebase
  const [authCheckCompleted, setAuthCheckCompleted] = useState(false);
  const queryClient = useQueryClient();

  // Query para buscar dados do usuário do backend
  const { 
    data: dbUser, 
    isLoading: isLoadingDbUser, 
    refetch: refetchDbUser, 
    error: dbUserError,
    isError,
  } = useQuery<DbUser, Error>({
    queryKey: ['dbUser', firebaseUser?.uid],
    queryFn: async () => {
      if (!firebaseUser?.uid) throw new Error('No Firebase user UID');
      const response = await fetch('/api/auth/user', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) throw new Error('No backend session');
        throw new Error('Failed to fetch user from backend');
      }
      return response.json();
    },
    enabled: !!firebaseUser?.uid, // Só executa se houver um usuário do Firebase
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Função para sincronizar o usuário do Firebase com o backend
  const syncUserWithBackend = useCallback(async (userToSync: User) => {
    try {
      const idToken = await userToSync.getIdToken(true); // Força a renovação do token
      const response = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Falha ao sincronizar' }));
        throw new Error(errorData.error);
      }
      const syncedUser: DbUser = await response.json();
      // Atualiza o cache do TanStack Query com os dados do novo usuário
      queryClient.setQueryData(['dbUser', userToSync.uid], syncedUser);
    } catch (error: any) {
      console.error('❌ Erro na sincronização com backend:', error.message);
      toast({ variant: "destructive", title: "Erro de autenticação", description: "Falha ao sincronizar com o servidor." });
      // Invalida a query para permitir uma nova tentativa se o usuário recarregar
      queryClient.invalidateQueries({ queryKey: ['dbUser', userToSync.uid] });
    }
  }, [queryClient]);

  // Efeito principal: Ouve o estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setAuthCheckCompleted(true); // Marca que a verificação inicial do Firebase foi concluída
      if (!user) {
        queryClient.removeQueries({ queryKey: ['dbUser'] });
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

  // Efeito para sincronizar com o backend apenas quando necessário
  useEffect(() => {
    // A condição para sincronizar é estrita para evitar loops:
    const shouldSync = firebaseUser && isError && dbUserError?.message === 'No backend session';
    if (shouldSync) {
      syncUserWithBackend(firebaseUser);
    }
  }, [firebaseUser, isError, dbUserError, syncUserWithBackend]);
  
  // Função de logout
  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      // onAuthStateChanged cuidará da limpeza do estado
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, []);
  
  const refreshDbUser = useCallback(async () => {
    await refetchDbUser();
  }, [refetchDbUser]);

  // Lógica de Carregamento Robusta e Derivada
  const loading = !authCheckCompleted || (!!firebaseUser && isLoadingDbUser);
  
  // Derivação dos estados para o contexto
  const isAuthenticated = !!firebaseUser && !!dbUser?.isProfileComplete;
  const isAdmin = dbUser?.isAdmin || dbUser?.userType === 'admin';
  const isGuide = dbUser?.userType === 'guide';
  const isOperator = dbUser?.userType === 'boat_tour_operator';
  const isProfileComplete = dbUser?.isProfileComplete || false;

  const value = {
    firebaseUser,
    dbUser,
    loading,
    isAuthenticated,
    isAdmin,
    isGuide,
    isOperator,
    isProfileComplete,
    logout,
    refreshDbUser,
    user: dbUser,
    isLoading: loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
