import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import BoatTourModal from "@/components/BoatTourModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ship, Clock, Users, Star, Check, CalendarPlus, Heart, Flame, Plus, MapPin, Fish, Sun, Camera, Compass } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function BoatTours() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showTourModal, setShowTourModal] = useState(false);

  // Note: Authentication is handled by App.tsx routing

  const { data: boatTours = [], isLoading: toursLoading, error } = useQuery<any[]>({
    queryKey: ["/api/boat-tours"],
    retry: false,
    enabled: !!user,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Erro de autorização",
      description: "Houve um problema com sua sessão. Tente recarregar a página.",
      variant: "destructive",
    });
    return null;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ocean"></div>
      </div>
    );
  }

  const canCreateTour = user?.userType === 'boat_tour_operator';

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <section className="bg-gradient-to-br from-ocean/20 via-tropical/10 to-sunset/10 dark:from-ocean/30 dark:via-tropical/20 dark:to-sunset/20 py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                <Ship className="inline h-12 w-12 text-ocean mr-4" />
                Passeios de Lancha
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Explore as ilhas e enseadas de Ubatuba com conforto e segurança. Reserve seu passeio com empresas confiáveis
              </p>
            </div>
            {canCreateTour && (
              <Button 
                onClick={() => setShowTourModal(true)}
                className="btn-gradient-ocean-sunset mt-6 lg:mt-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Passeio
              </Button>
            )}
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
                <Card key={tour.id} className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setLocation(`/boat-tours/${tour.slug || tour.id}`)}>
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
                    
                    <div className="absolute top-4 left-4 flex flex-col gap-1 max-w-[200px]">
                      {tour.isPopular && (
                        <Badge className="bg-sunset text-white border-0 text-xs">
                          <Flame className="h-3 w-3 mr-1" />
                          Mais Popular
                        </Badge>
                      )}
                      {tour.isRomantic && (
                        <Badge className="bg-pink-500 text-white border-0 text-xs">
                          <Heart className="h-3 w-3 mr-1" />
                          Romântico
                        </Badge>
                      )}
                      {tour.isFishing && (
                        <Badge className="bg-blue-600 text-white border-0 text-xs">
                          <Fish className="h-3 w-3 mr-1" />
                          Pesca
                        </Badge>
                      )}
                      {tour.isWhaleWatching && (
                        <Badge className="bg-ocean text-white border-0 text-xs">
                          <Camera className="h-3 w-3 mr-1" />
                          Baleias
                        </Badge>
                      )}
                      {tour.isSunset && (
                        <Badge className="bg-orange-500 text-white border-0 text-xs">
                          <Sun className="h-3 w-3 mr-1" />
                          Pôr do Sol
                        </Badge>
                      )}
                      {tour.isAdventure && (
                        <Badge className="bg-green-600 text-white border-0 text-xs">
                          <Compass className="h-3 w-3 mr-1" />
                          Aventura
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
                    <h3 className="text-xl font-bold text-foreground mb-2">{tour.name}</h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {tour.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{tour.duration} horas</span>
                        <Users className="h-4 w-4 ml-4 mr-2" />
                        <span>Até {tour.maxPeople} pessoas</span>
                      </div>
                      {tour.departureLocation && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{tour.departureLocation}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm">
                        <div className="font-semibold text-foreground">{tour.companyName}</div>
                        <div className="flex items-center text-yellow-400">
                          <Star className="h-4 w-4" />
                          <span className="text-muted-foreground ml-1">{tour.rating || '0.0'} ({tour.reviewCount || 0})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-ocean">R$ {tour.price}</div>
                        <div className="text-xs text-slate-500">por pessoa</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {tour.includes?.slice(0, 3).map((item: string, index: number) => (
                        <div key={index} className="flex items-center text-sm text-muted-foreground">
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

      {/* Boat Tour Modal */}
      <BoatTourModal 
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
      />
    </div>
  );
}
