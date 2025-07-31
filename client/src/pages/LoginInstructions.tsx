import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  LogIn, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  Globe, 
  Info,
  Clock
} from "lucide-react";

export default function LoginInstructions() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);
  const [autoRedirect, setAutoRedirect] = useState(false);

  useEffect(() => {
    if (autoRedirect && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoRedirect && countdown === 0) {
      handleLogin();
    }
  }, [countdown, autoRedirect]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleAutoRedirect = () => {
    setAutoRedirect(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean/5 via-white to-sunset/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-ocean to-ocean-dark rounded-full flex items-center justify-center mx-auto">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Entrar no UbatubaIA</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Seu guia inteligente para turismo em Ubatuba
            </p>
          </div>
        </div>

        {/* Instructions Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-ocean" />
              Instruções para Login Seguro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Warning about English page */}
            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> A próxima página será exibida em inglês pois é controlada pelo Replit. 
                Não se preocupe, as instruções abaixo te ajudarão durante o processo.
              </AlertDescription>
            </Alert>

            {/* Step by step instructions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Passo a passo (em inglês na próxima página):
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-6 h-6 bg-ocean rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Clique em "Authorize" ou "Allow"</p>
                    <p className="text-sm text-muted-foreground">Autorize o UbatubaIA a acessar suas informações básicas do Replit</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-6 h-6 bg-ocean rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Confirme suas permissões</p>
                    <p className="text-sm text-muted-foreground">O sistema pedirá acesso ao seu email e nome - isso é seguro e necessário</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Retorno automático</p>
                    <p className="text-sm text-muted-foreground">Você será redirecionado automaticamente de volta para o UbatubaIA</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security info */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Login 100% Seguro</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Utilizamos o sistema oficial de autenticação do Replit. Suas credenciais ficam protegidas 
                    e nunca são compartilhadas conosco.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleLogin} 
                className="flex-1 bg-gradient-to-r from-ocean to-ocean-dark hover:from-ocean-dark hover:to-ocean"
                size="lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Fazer Login Agora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              {!autoRedirect && (
                <Button 
                  onClick={handleAutoRedirect}
                  variant="outline" 
                  size="lg"
                  className="flex-1"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  Redirecionar Automaticamente
                </Button>
              )}
            </div>

            {/* Auto redirect countdown */}
            {autoRedirect && (
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Redirecionando automaticamente em <strong>{countdown}</strong> segundos...
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setAutoRedirect(false)}
                  className="mt-2 text-blue-600 hover:text-blue-700"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Primeira vez no UbatubaIA? Após o login, você poderá criar seu perfil personalizado
          </p>
        </div>
      </div>
    </div>
  );
}