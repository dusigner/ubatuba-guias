import { useParams, useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Waves, Star, MapPin, Clock, Users, ArrowLeft, Share2,
  Heart, Camera, Umbrella, Car, Utensils, Palmtree, 
  Wifi, ShoppingBag, Accessibility, Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function BeachProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites(user?.id);
  const beachId = params.id;

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

  const { data: beach, isLoading: beachLoading, error } = useQuery<any>({
    queryKey: ["/api/beaches", beachId],
    retry: false,
    enabled: isAuthenticated && !!beachId,
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

  if (isLoading || beachLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ocean"></div>
      </div>
    );
  }

  if (!beach) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Praia não encontrada</h1>
          <Button onClick={() => setLocation("/beaches")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Praias
          </Button>
        </div>
      </div>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('estacionamento')) return <Car className="h-4 w-4" />;
    if (amenityLower.includes('restaurante') || amenityLower.includes('bar')) return <Utensils className="h-4 w-4" />;
    if (amenityLower.includes('guarda-sol') || amenityLower.includes('cadeira')) return <Umbrella className="h-4 w-4" />;
    if (amenityLower.includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (amenityLower.includes('loja') || amenityLower.includes('comércio')) return <ShoppingBag className="h-4 w-4" />;
    if (amenityLower.includes('salva-vidas')) return <Shield className="h-4 w-4" />;
    if (amenityLower.includes('acessível')) return <Accessibility className="h-4 w-4" />;
    return <Palmtree className="h-4 w-4" />;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${beach.name} - Praia em Ubatuba`,
        text: `Conheça a ${beach.name} em Ubatuba - Uma das belas praias da região`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link da praia foi copiado para a área de transferência",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header simplificado com botão voltar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/beaches")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Praias
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/")}
                className="text-sm"
              >
                UbatubaIA
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ocean/10 to-tropical/10 py-12">
        <div className="container mx-auto px-4">
          <div className="relative">
            <img
              src={beach.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400'}
              alt={beach.name}
              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-4xl font-bold mb-2">{beach.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-white/90">
                    <MapPin className="h-4 w-4" />
                    <span>{beach.location}</span>
                  </div>
                  {beach.waterTemp && (
                    <div className="flex items-center gap-1 text-white/90">
                      <Waves className="h-4 w-4" />
                      <span>{beach.waterTemp}°C</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(parseFloat(beach.rating) || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-white/50'
                      }`}
                    />
                  ))}
                  <span className="text-lg font-semibold">{beach.rating || '0.0'}</span>
                  <span className="text-white/90">
                    ({beach.reviewCount || 0} avaliações)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descrição */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-primary" />
                  Sobre a Praia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {beach.description}
                </p>
              </CardContent>
            </Card>

            {/* Atividades */}
            {beach.activities && beach.activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Atividades Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {beach.activities.map((activity: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <Waves className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-800">{activity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comodidades */}
            {beach.amenities && beach.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palmtree className="h-5 w-5 text-primary" />
                    Comodidades e Serviços
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {beach.amenities.map((amenity: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        {getAmenityIcon(amenity)}
                        <span className="text-green-800">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Umbrella className="h-5 w-5 text-primary" />
                  Dicas para sua Visita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-700">Melhor horário: manhã (7h-10h) ou tarde (15h-18h) para evitar multidões</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <Umbrella className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-700">Traga protetor solar, chapéu e água. O sol forte de Ubatuba requer cuidado</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700">Respeite a natureza - leve seu lixo de volta e preserve a vida marinha</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar de Informações */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-primary" />
                  Informações da Praia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Localização</span>
                  <span className="font-bold text-tropical">{beach.location}</span>
                </div>
                <Separator />
                {beach.waterTemp && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Temp. da Água</span>
                      <span className="font-bold text-ocean">{beach.waterTemp}°C</span>
                    </div>
                    <Separator />
                  </>
                )}
                {beach.waveCondition && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Condição das Ondas</span>
                      <Badge variant="secondary">{beach.waveCondition}</Badge>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Avaliação</span>
                  <span className="font-bold text-yellow-600">{beach.rating || '0.0'} ⭐</span>
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button 
                    onClick={() => toggleFavorite('beach', beachId)}
                    disabled={isToggling}
                    variant={isFavorite('beach', beachId) ? "default" : "outline"}
                    className="w-full"
                  >
                    <Heart 
                      className={`h-4 w-4 mr-2 ${
                        isFavorite('beach', beachId) ? 'fill-current' : ''
                      }`} 
                    />
                    {isFavorite('beach', beachId) ? 'Favoritado' : 'Favoritar'}
                  </Button>
                  <Button 
                    onClick={() => setLocation("/boat-tours")}
                    className="w-full bg-gradient-to-r from-ocean to-tropical text-white"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Ver Passeios de Barco
                  </Button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    🌊 <strong>Dica Local:</strong> Esta praia faz parte do litoral norte de SP, conhecido pelas águas cristalinas e natureza preservada.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}