import { useParams, useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { useBookings } from "@/hooks/useBookings";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Anchor, Star, MapPin, Clock, Users, ArrowLeft, Share2,
  Heart, Camera, DollarSign, Calendar, Phone, Mail,
  Waves, Fish, Sun, Shield, Compass, LifeBuoy
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function BoatTourProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites(user?.id);
  const { createBooking, isCreating } = useBookings(user?.id);
  const tourId = params.id;

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

  const { data: tour, isLoading: tourLoading, error } = useQuery<any>({
    queryKey: ["/api/boat-tours", tourId],
    retry: false,
    enabled: isAuthenticated && !!tourId,
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

  if (isLoading || tourLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ocean"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Passeio não encontrado</h1>
          <Button onClick={() => setLocation("/boat-tours")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Passeios
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIncludeIcon = (item: string) => {
    const itemLower = item.toLowerCase();
    if (itemLower.includes('equipamento') || itemLower.includes('snorkel')) return <LifeBuoy className="h-4 w-4" />;
    if (itemLower.includes('comida') || itemLower.includes('lanche')) return <Sun className="h-4 w-4" />;
    if (itemLower.includes('bebida')) return <Waves className="h-4 w-4" />;
    if (itemLower.includes('guia')) return <Users className="h-4 w-4" />;
    if (itemLower.includes('seguro')) return <Shield className="h-4 w-4" />;
    return <Anchor className="h-4 w-4" />;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${tour.name} - Passeio de Barco em Ubatuba`,
        text: `Conheça o passeio ${tour.name} em Ubatuba - ${tour.duration}h por ${formatPrice(tour.price)}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link do passeio foi copiado para a área de transferência",
      });
    }
  };

  const handleBooking = () => {
    const message = `Olá! Gostaria de agendar o passeio "${tour.name}" para ${tour.maxCapacity} pessoas. Podem me ajudar com as informações?`;
    const whatsappUrl = `https://wa.me/5512999990001?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header simplificado com botão voltar */}
      <div className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-md bg-background/95">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/boat-tours")}
              className="flex items-center gap-2 text-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Passeios de Barco
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/")}
                className="text-sm text-foreground hover:text-foreground"
              >
                UbatubaIA
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ocean/10 to-tropical/10 dark:from-ocean/20 dark:to-tropical/20 py-12">
        <div className="container mx-auto px-4">
          <div className="relative">
            <img
              src={tour.imageUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400'}
              alt={tour.name}
              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-4xl font-bold mb-2">{tour.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-white/90">
                    <Clock className="h-4 w-4" />
                    <span>{tour.duration}h de duração</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/90">
                    <Users className="h-4 w-4" />
                    <span>Até {tour.maxCapacity} pessoas</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/90">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xl font-bold text-green-300">{formatPrice(tour.price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(parseFloat(tour.rating) || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-white/50'
                      }`}
                    />
                  ))}
                  <span className="text-lg font-semibold">{tour.rating || '0.0'}</span>
                  <span className="text-white/90">
                    ({tour.reviewCount || 0} avaliações)
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
                  <Anchor className="h-5 w-5 text-primary" />
                  Sobre o Passeio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {tour.description}
                </p>
              </CardContent>
            </Card>

            {/* Roteiro */}
            {tour.route && tour.route.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    Roteiro do Passeio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tour.route.map((stop: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-blue-800">{stop}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* O que está incluído */}
            {tour.includes && tour.includes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LifeBuoy className="h-5 w-5 text-primary" />
                    O que está incluído
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tour.includes.map((item: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        {getIncludeIcon(item)}
                        <span className="text-green-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Horários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Horários Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tour.schedule?.map((time: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="justify-center py-2 text-center"
                    >
                      {formatTime(time)}
                    </Badge>
                  )) || (
                    <div className="col-span-full">
                      <p className="text-slate-600">Horários disponíveis mediante consulta</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações Importantes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <Users className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-700">Capacidade máxima: {tour.maxCapacity} pessoas por embarcação</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-700">Apresentar-se 30 minutos antes do horário marcado</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <LifeBuoy className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700">Todos os equipamentos de segurança estão inclusos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar de Reserva */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="h-5 w-5 text-primary" />
                  Reservar Passeio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {formatPrice(tour.price)}
                  </div>
                  <p className="text-sm text-slate-600">por pessoa</p>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Duração</span>
                  <span className="font-bold text-ocean">{tour.duration} horas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Capacidade</span>
                  <span className="font-bold text-tropical">Até {tour.maxCapacity} pessoas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Avaliação</span>
                  <span className="font-bold text-yellow-600">{tour.rating || '0.0'} ⭐</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button 
                    onClick={handleBooking}
                    className="w-full bg-gradient-to-r from-ocean to-tropical text-white"
                    size="lg"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Reservar via WhatsApp
                  </Button>
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Favoritar
                  </Button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    ⚓ <strong>Dica:</strong> Reserve com antecedência, especialmente nos fins de semana e feriados!
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Contato Direto</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span>(12) 99999-0001</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span>contato@passeiosubatuba.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}