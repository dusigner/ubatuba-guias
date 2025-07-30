import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Umbrella, Star, Images, Award, Leaf, Camera, MountainSnow } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Beaches() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você precisa estar logado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: beaches = [], isLoading: beachesLoading, error } = useQuery<any[]>({
    queryKey: ["/api/beaches"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Não autorizado",
      description: "Você foi desconectado. Fazendo login novamente...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ocean"></div>
      </div>
    );
  }

  const getActivityIcon = (activity: string) => {
    switch (activity.toLowerCase()) {
      case 'surf':
        return '🏄‍♂️';
      case 'mergulho':
      case 'diving':
        return '🤿';
      case 'cenário':
      case 'scenic':
        return '📸';
      case 'trilha':
      case 'trail':
        return '🥾';
      default:
        return '🌊';
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'estacionamento':
      case 'parking':
        return '🅿️';
      case 'restaurantes':
      case 'restaurants':
        return '🍽️';
      case 'salva-vidas':
      case 'lifeguard':
        return '🛟';
      default:
        return '✅';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <section className="bg-gradient-to-br from-ocean/10 to-tropical/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
              <Umbrella className="inline h-12 w-12 text-ocean mr-4" />
              Praias Paradisíacas
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Descubra as mais belas praias de Ubatuba com todas as informações que você precisa para planejar sua visita perfeita
            </p>
          </div>
        </div>
      </section>

      {/* Beaches Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {beachesLoading ? (
            <div className="grid lg:grid-cols-2 gap-12">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : beaches && beaches.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-12">
              {beaches.map((beach: any) => (
                <Card key={beach.id} className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer" onClick={() => setLocation(`/beaches/${beach.id}`)}>
                  <div className="relative">
                    <img 
                      src={beach.imageUrl || (beach.isTopRated 
                        ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600'
                        : 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600')} 
                      alt={beach.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    <div className="absolute top-4 left-4">
                      {beach.isTopRated && (
                        <Badge className="bg-white/90 backdrop-blur-sm text-slate-800 border-0">
                          <Award className="h-4 w-4 text-sunset mr-1" />
                          Top Rated
                        </Badge>
                      )}
                      {beach.isPreserved && (
                        <Badge className="bg-white/90 backdrop-blur-sm text-slate-800 border-0 ml-2">
                          <Leaf className="h-4 w-4 text-tropical mr-1" />
                          Preservada
                        </Badge>
                      )}
                    </div>
                    
                    <div className="absolute bottom-4 right-4 flex space-x-2">
                      {beach.activities?.slice(0, 2).map((activity: string, index: number) => (
                        <Badge key={index} className="bg-tropical text-white border-0">
                          {getActivityIcon(activity)} {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">{beach.name}</h3>
                    <p className="text-slate-600 mb-4">
                      {beach.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {beach.features?.slice(0, 3).map((feature: string, index: number) => (
                        <div key={index} className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-xl mb-2">{getFeatureIcon(feature)}</div>
                          <div className="text-xs text-slate-600">{feature}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-slate-600">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{beach.rating || '0.0'} ({beach.reviewCount || 0} avaliações)</span>
                      </div>
                      <Button variant="ghost" className="text-ocean hover:text-ocean/80">
                        Ver mais fotos <Images className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Umbrella className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Nenhuma praia encontrada</h3>
              <p className="text-slate-600 mb-8">
                Parece que ainda não temos praias cadastradas no sistema. Nossa equipe está trabalhando para adicionar as mais belas praias de Ubatuba.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-ocean text-white hover:bg-ocean/90"
              >
                Atualizar Página
              </Button>
            </div>
          )}
          
          {beaches && beaches.length > 0 && (
            <div className="text-center mt-12">
              <Button className="bg-ocean text-white hover:bg-ocean/90">
                <Umbrella className="h-4 w-4 mr-2" />
                Ver todas as praias ({beaches.length})
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
