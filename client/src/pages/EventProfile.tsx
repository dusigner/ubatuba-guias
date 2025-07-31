import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { useBookings } from "@/hooks/useBookings";
import Navigation from "@/components/Navigation";
import EventModal from "@/components/EventModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, Star, MapPin, Clock, Users, ArrowLeft, Share2,
  Heart, Camera, DollarSign, Phone, Mail, Music, 
  Ticket, PartyPopper, Coffee, Car, Utensils, Gift, Edit, Trash2
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EventProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites(user?.id);
  const { createBooking, isCreating } = useBookings(user?.id);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const eventId = params.id;

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/events/${id}`, 'DELETE'),
    onSuccess: () => {
      toast({
        title: "Evento excluído!",
        description: "O evento foi removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setLocation("/events");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o evento.",
        variant: "destructive",
      });
    },
  });

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

  const { data: event, isLoading: eventLoading, error } = useQuery<any>({
    queryKey: ["/api/events", eventId],
    retry: false,
    enabled: isAuthenticated && !!eventId,
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

  if (isLoading || eventLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ocean"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Evento não encontrado</h1>
          <Button onClick={() => setLocation("/events")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Eventos
          </Button>
        </div>
      </div>
    );
  }



  const formatPrice = (priceString: string) => {
    // Handle string prices like "Gratuito", "R$ 50", etc.
    if (!priceString || priceString.toLowerCase().includes('gratuito') || priceString === '0') {
      return "Gratuito";
    }
    
    // If it's already formatted, return as is
    if (priceString.includes('R$') || priceString.includes('-')) {
      return priceString;
    }
    
    // Try to parse as number
    const numPrice = parseFloat(priceString);
    if (isNaN(numPrice) || numPrice === 0) {
      return "Gratuito";
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'música':
      case 'music':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
      case 'gastronomia':
      case 'food':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
      case 'cultura':
      case 'cultural':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'esporte':
      case 'sport':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'festa':
      case 'party':
        return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/20 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'música':
      case 'music':
        return <Music className="h-4 w-4" />;
      case 'gastronomia':
      case 'food':
        return <Utensils className="h-4 w-4" />;
      case 'cultura':
      case 'cultural':
        return <Camera className="h-4 w-4" />;
      case 'esporte':
      case 'sport':
        return <Users className="h-4 w-4" />;
      case 'festa':
      case 'party':
        return <PartyPopper className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const isEventPast = new Date(event.startDate) < new Date();
  const isEventSoon = new Date(event.startDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${event.title} - Evento em Ubatuba`,
        text: `${event.title} em ${event.location} - ${formatDate(event.startDate)}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link do evento foi copiado para a área de transferência",
      });
    }
  };

  const handleTicket = () => {
    // If there's a ticket link, use it directly
    if (event.ticketLink && event.ticketLink.trim()) {
      window.open(event.ticketLink, '_blank');
      return;
    }
    
    // Otherwise, use WhatsApp as fallback
    const message = `Olá! Gostaria de informações sobre ingressos para o evento "${event.title}" no dia ${formatDate(event.startDate)}`;
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
              onClick={() => setLocation("/events")}
              className="flex items-center gap-2 text-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Eventos
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
      <section className="bg-gradient-to-br from-tropical/10 to-ocean/10 dark:from-tropical/20 dark:to-ocean/20 py-12">
        <div className="container mx-auto px-4">
          <div className="relative">
            <img
              src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400'}
              alt={event.name}
              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-end">
              <div className="p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getCategoryColor(event.category)} border`}>
                    {getCategoryIcon(event.category)}
                    <span className="ml-1">{event.category}</span>
                  </Badge>
                  {isEventPast && (
                    <Badge variant="destructive">Evento Finalizado</Badge>
                  )}
                  {isEventSoon && !isEventPast && (
                    <Badge className="bg-yellow-500 text-yellow-900">Acontece em breve!</Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-white/90">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/90">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/90">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-green-300">
                    {formatPrice(event.ticketPrice)}
                  </div>
                  {event.maxCapacity && (
                    <div className="flex items-center gap-1 text-white/90">
                      <Users className="h-4 w-4" />
                      <span>Até {event.maxCapacity} pessoas</span>
                    </div>
                  )}
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
                  {getCategoryIcon(event.category)}
                  Sobre o Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Programação */}
            {event.schedule && event.schedule.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Programação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.schedule.map((item: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-blue-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Organizador */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Organizador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-tropical to-ocean rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {event.organizerName?.charAt(0) || 'O'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {event.organizerName || 'Organizador do Evento'}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Organizador em Ubatuba
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Importantes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-700">
                      {isEventPast 
                        ? "Este evento já foi realizado" 
                        : "Chegue 30 minutos antes do horário de início"}
                    </span>
                  </div>
                  {event.maxCapacity && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                      <Users className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-amber-700">Vagas limitadas: {event.maxCapacity} pessoas</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <Car className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700">Confirme as opções de estacionamento na região</span>
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
                  <Ticket className="h-5 w-5 text-primary" />
                  {isEventPast ? "Informações do Evento" : "Ingressos"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${event.ticketPrice === '0' || event.ticketPrice?.toLowerCase().includes('gratuito') ? 'text-green-600' : 'text-blue-600'}`}>
                    {formatPrice(event.ticketPrice)}
                  </div>
                  {event.ticketPrice !== '0' && !event.ticketPrice?.toLowerCase().includes('gratuito') && <p className="text-sm text-slate-600">por pessoa</p>}
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Data</span>
                  <span className="font-bold text-tropical">{formatDate(event.startDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Horário</span>
                  <span className="font-bold text-ocean">{formatTime(event.startDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Local</span>
                  <span className="font-bold text-slate-800 text-right text-sm">{event.location}</span>
                </div>
                {event.maxCapacity && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Capacidade</span>
                    <span className="font-bold text-purple-600">{event.maxCapacity} pessoas</span>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  {/* Edit button for event producers who created this event */}
                  {(user?.userType === 'eventProducer' || user?.userType === 'event_producer') && 
                   (event.producerName === `${user.firstName} ${user.lastName}` || event.producerName === user.email) && (
                    <Button 
                      onClick={() => setIsEditModalOpen(true)}
                      variant="outline"
                      className="w-full border-sunset text-sunset hover:bg-sunset hover:text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Evento
                    </Button>
                  )}

                  {/* Delete button for event producers who created this event */}
                  {(user?.userType === 'eventProducer' || user?.userType === 'event_producer') && 
                   (event.producerName === `${user.firstName} ${user.lastName}` || event.producerName === user.email) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir Evento
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O evento "{event.title}" será permanentemente removido do sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteEventMutation.mutate(event.id)}
                            disabled={deleteEventMutation.isPending}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {deleteEventMutation.isPending ? "Excluindo..." : "Sim, excluir"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  
                  {!isEventPast && (
                    <Button 
                      onClick={handleTicket}
                      className="w-full bg-gradient-to-r from-tropical to-ocean text-white"
                      size="lg"
                    >
                      <Ticket className="h-4 w-4 mr-2" />
                      {(event.ticketPrice === '0' || event.ticketPrice?.toLowerCase().includes('gratuito')) ? 'Confirmar Presença' : 'Comprar Ingresso'}
                    </Button>
                  )}
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
                    🎉 <strong>Dica:</strong> {isEventPast 
                      ? "Fique atento aos próximos eventos em Ubatuba!"
                      : "Chegue cedo para garantir o melhor lugar e aproveitar toda a programação!"}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Contato do Organizador</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span>(12) 99999-0001</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span>eventos@ubatuba.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EventModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={event}
        isEditing={true}
      />
    </div>
  );
}