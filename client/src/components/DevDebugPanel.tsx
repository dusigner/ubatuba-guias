import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function DevDebugPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resetProfileMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/profile/reset", "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "Perfil resetado!",
        description: "O perfil foi resetado para testar o fluxo completo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao resetar perfil",
        variant: "destructive",
      });
    },
  });

  // Só mostrar em desenvolvimento
  if (import.meta.env.PROD) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-yellow-50 border-yellow-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">🛠️ Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-gray-600">
          <p><strong>Usuário:</strong> {user?.firstName} {user?.lastName}</p>
          <p><strong>Tipo:</strong> {user?.userType || "Não definido"}</p>
          <p><strong>Perfil completo:</strong> {user?.isProfileComplete ? "Sim" : "Não"}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs"
          onClick={() => resetProfileMutation.mutate()}
          disabled={resetProfileMutation.isPending}
        >
          {resetProfileMutation.isPending ? "Resetando..." : "Resetar Perfil (Teste)"}
        </Button>
      </CardContent>
    </Card>
  );
}