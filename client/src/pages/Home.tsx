import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import AIItinerary from "@/components/AIItinerary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, MapPin, Clock, Star, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você precisa estar logado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(async () => {
        const { signInWithGoogle } = await import('@/lib/firebase');
        signInWithGoogle();
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: recentItineraries = [], isLoading: itinerariesLoading } = useQuery<any[]>({
    queryKey: ["/api/itineraries"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-tropical/20 via-ocean/10 to-sunset/10 dark:from-tropical/30 dark:via-ocean/20 dark:to-sunset/20 border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Bem-vindo de volta, {user?.firstName || 'Explorador'}!
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Pronto para descobrir novos destinos em Ubatuba? Nossa IA está preparada para criar o roteiro perfeito para você.
            </p>
            <AIItinerary>
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-primary text-white hover:opacity-90 text-lg px-8 py-6">
                <Sparkles className="h-5 w-5 mr-2" />
                Criar Novo Roteiro com IA
              </Button>
            </AIItinerary>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-ocean mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">32</div>
                <div className="text-sm text-muted-foreground">Praias Catalogadas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-tropical mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">18</div>
                <div className="text-sm text-muted-foreground">Trilhas Disponíveis</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-sunset mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">25</div>
                <div className="text-sm text-muted-foreground">Passeios de Lancha</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-ocean mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">47</div>
                <div className="text-sm text-muted-foreground">Guias Certificados</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Itineraries */}
      {recentItineraries && recentItineraries.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-8">Seus Roteiros Recentes</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItineraries.slice(0, 3).map((itinerary: any) => (
                <Card key={itinerary.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground">{itinerary.title}</h3>
                      <span className="bg-ocean/10 text-ocean px-2 py-1 rounded text-sm">
                        {itinerary.duration} {itinerary.duration === 1 ? 'dia' : 'dias'}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {itinerary.content?.summary || 'Roteiro personalizado gerado por IA'}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Criado em {new Date(itinerary.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8">Explore Ubatuba</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/trails">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="bg-tropical/10 dark:bg-tropical/20 p-4 rounded-full w-fit mx-auto mb-4 group-hover:bg-tropical/20 dark:group-hover:bg-tropical/30 transition-colors">
                    <MapPin className="h-8 w-8 text-tropical" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Trilhas</h3>
                  <p className="text-sm text-muted-foreground">Descubra as melhores trilhas da região</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/beaches">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="bg-ocean/10 dark:bg-ocean/20 p-4 rounded-full w-fit mx-auto mb-4 group-hover:bg-ocean/20 dark:group-hover:bg-ocean/30 transition-colors">
                    <MapPin className="h-8 w-8 text-ocean" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Praias</h3>
                  <p className="text-sm text-muted-foreground">Explore praias paradisíacas</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/boat-tours">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="bg-sunset/10 dark:bg-sunset/20 p-4 rounded-full w-fit mx-auto mb-4 group-hover:bg-sunset/20 dark:group-hover:bg-sunset/30 transition-colors">
                    <Clock className="h-8 w-8 text-sunset" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Passeios</h3>
                  <p className="text-sm text-muted-foreground">Reserve passeios de lancha</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/guides">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="bg-tropical/10 dark:bg-tropical/20 p-4 rounded-full w-fit mx-auto mb-4 group-hover:bg-tropical/20 dark:group-hover:bg-tropical/30 transition-colors">
                    <Star className="h-8 w-8 text-tropical" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Guias</h3>
                  <p className="text-sm text-muted-foreground">Conecte-se com guias locais</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
