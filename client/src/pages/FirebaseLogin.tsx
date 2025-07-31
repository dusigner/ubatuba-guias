import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Waves, Mountain, Users } from "lucide-react";

export default function FirebaseLogin() {
  const { user, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    // User is already logged in, redirect will be handled by auth context
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              UbatubaIA
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
                Entre com sua conta Google para acessar o UbatubaIA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full h-12 text-base"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar com Google
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