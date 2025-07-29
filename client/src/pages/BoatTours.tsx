import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ship, Clock, Users, Star, Check, CalendarPlus, Heart, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function BoatTours() {
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

  const { data: boatTours = [], isLoading: toursLoading, error } = useQuery<any[]>({
    queryKey: ["/api/boat-tours"],
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

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <section className="bg-gradient-to-br from-ocean/10 to-tropical/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
              <Ship className="inline h-12 w-12 text-ocean mr-4" />
              Passeios de Lancha
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore as ilhas e enseadas de Ubatuba com conforto e segurança. Reserve seu passeio com empresas confiáveis
            </p>
          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {toursLoading ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : boatTours && boatTours.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {boatTours.map((tour: any) => (
                <Card key={tour.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img 
                      src={tour.imageUrl || (tour.isPopular 
                        ? 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
                        : tour.isRomantic 
                        ? 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
                        : 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400')} 
                      alt={tour.name}
                      className="w-full h-48 object-cover"
                    />
                    
                    <div className="absolute top-4 left-4">
                      {tour.isPopular && (
                        <Badge className="bg-sunset text-white border-0">
                          <Flame className="h-4 w-4 mr-1" />
                          Mais Popular
                        </Badge>
                      )}
                      {tour.isRomantic && (
                        <Badge className="bg-sunset text-white border-0">
                          <Heart className="h-4 w-4 mr-1" />
                          Romântico
                        </Badge>
                      )}
                    </div>
                    
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 backdrop-blur-sm text-slate-800 border-0 font-bold">
                        R$ {tour.price}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{tour.name}</h3>
                    <p className="text-slate-600 mb-4 text-sm">
                      {tour.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-slate-600 mb-4">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{tour.duration} horas</span>
                      <Users className="h-4 w-4 ml-4 mr-2" />
                      <span>Até {tour.maxPeople} pessoas</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm">
                        <div className="font-semibold text-slate-800">{tour.companyName}</div>
                        <div className="flex items-center text-yellow-400">
                          <Star className="h-4 w-4" />
                          <span className="text-slate-600 ml-1">{tour.rating || '0.0'} ({tour.reviewCount || 0})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-ocean">R$ {tour.price}</div>
                        <div className="text-xs text-slate-500">por pessoa</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {tour.includes?.slice(0, 3).map((item: string, index: number) => (
                        <div key={index} className="flex items-center text-sm text-slate-600">
                          <Check className="h-4 w-4 text-tropical mr-2" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button className="w-full bg-ocean text-white hover:bg-ocean/90">
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Reservar Agora
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Ship className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Nenhum passeio encontrado</h3>
              <p className="text-slate-600 mb-8">
                Parece que ainda não temos passeios de lancha cadastrados no sistema. Nossa equipe está trabalhando para adicionar as melhores opções de Ubatuba.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-ocean text-white hover:bg-ocean/90"
              >
                Atualizar Página
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
