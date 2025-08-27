
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Chrome, Waves, Mountain, Ship, Calendar, Users, MapPin, Shield, Home as HomeIcon } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function FirebaseLogin() {
  const { user, isAuthenticated, isProfileComplete, isLoading, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();

  // Efeito para redirecionar o usuário com base no estado de autenticação
  useEffect(() => {
    if (isLoading) return; // Espera o carregamento inicial terminar

    // Se a autenticação foi concluída E o perfil está completo, vai para a home.
    if (isAuthenticated && isProfileComplete) {
      if (location !== "/") {
        console.log("Redirecting to / (isAuthenticated & isProfileComplete)");
        setLocation("/");
      }
    } 
    // Se existe um usuário logado (dbUser não é nulo) mas o perfil não está completo, vai para a criação de perfil.
    else if (user && !isProfileComplete) {
      if (location !== "/create-profile") {
        console.log("Redirecting to /create-profile (user exists but profile incomplete)");
        setLocation("/create-profile");
      }
    }
  }, [isAuthenticated, isProfileComplete, user, isLoading, setLocation, location]);

  const handleGoogleSignIn = async () => {
    if (isLoggingIn) return;
    try {
      // 1. Apenas inicia o login com o pop-up do Google.
      // A sincronização com o backend será feita pelo useAuth em um useEffect.
      await signInWithGoogle();
      // O useEffect acima cuidará do redirecionamento após o estado do useAuth ser atualizado.
    } catch (error) {
      console.error('Erro no processo de login com Google:', error);
    }
  };

  if (isLoading || isLoggingIn || (auth.currentUser && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-lg">Processando autenticação...</p>
      </div>
    );
  }

  // Não renderiza nada se o usuário já estiver autenticado,
  // pois o useEffect irá redirecionar.
  if (isAuthenticated || (user && !isProfileComplete)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Ubatuba Guias
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Descubra as maravilhas de Ubatuba com inteligência artificial
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Fazer Login</CardTitle>
              <CardDescription>
                Entre com sua conta Google para acessar o Ubatuba Guias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full h-12 text-base"
                size="lg"
                disabled={isLoggingIn || isLoading}
              >
                <Chrome className="w-5 h-5 mr-2" />
                {isLoggingIn ? "Entrando..." : "Entrar com Google"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <Waves className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Praias</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Descubra as mais belas praias de Ubatuba
              </p>
            </div>
            <div className="text-center p-6">
              <Mountain className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Trilhas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Explore trilhas incríveis na Mata Atlântica
              </p>
            </div>
            <div className="text-center p-6">
              <Users className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Guias</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Conecte-se com guias locais experientes
              </p>
            </div>
            <div className="text-center p-6">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Roteiros IA</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Roteiros personalizados com inteligência artificial
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
