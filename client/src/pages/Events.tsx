import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import EventModal from "@/components/EventModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Ticket, ArrowRight, Plus, Music, Leaf, Fish, User, Filter, ArrowUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Events() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showEventModal, setShowEventModal] = useState(false);
  const [, setLocation] = useLocation();
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [priceFilter, setPriceFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("data");
  const [sortOrder, setSortOrder] = useState("asc");

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

  const { data: events = [], isLoading: eventsLoading, error } = useQuery<any[]>({
    queryKey: ["/api/events"],
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'música':
      case 'music':
        return Music;
      case 'cultural':
        return Leaf;
      case 'comida':
      case 'food':
        return Fish;
      default:
        return Calendar;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short'
    }).toUpperCase();
  };

  const canCreateEvent = user?.userType === 'event_producer';

  // Format price for filtering
  const getEventPrice = (event: any) => {
    if (!event.ticketPrice || event.ticketPrice === '0' || event.ticketPrice.toLowerCase().includes('gratuito')) {
      return 0;
    }
    return parseFloat(event.ticketPrice.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  };

  // Filter and sort events
  const filteredAndSortedEvents = events
    .filter((event: any) => {
      // Search term filter
      if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.location.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "todos" && event.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // Price filter
      if (priceFilter !== "todos") {
        const price = getEventPrice(event);
        if (priceFilter === "gratuito" && price > 0) return false;
        if (priceFilter === "pago" && price === 0) return false;
      }

      return true;
    })
    .sort((a: any, b: any) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case "data":
          compareValue = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case "nome":
          compareValue = a.title.localeCompare(b.title);
          break;
        case "preco":
          compareValue = getEventPrice(a) - getEventPrice(b);
          break;
        case "categoria":
          compareValue = a.category.localeCompare(b.category);
          break;
        default:
          compareValue = 0;
      }
      
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  const categories = [...new Set(events.map((event: any) => event.category))];

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <section className="bg-gradient-to-br from-sunset/20 via-ocean/10 to-tropical/10 dark:from-sunset/30 dark:via-ocean/20 dark:to-tropical/20 py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                <Calendar className="inline h-12 w-12 text-sunset mr-4" />
                Eventos em Ubatuba
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Descubra os melhores eventos e festivais da região. Produtores locais podem divulgar seus eventos
              </p>
            </div>
            {canCreateEvent && (
              <Button 
                onClick={() => setShowEventModal(true)}
                className="bg-gradient-to-r from-sunset to-ocean text-white hover:opacity-90 mt-6 lg:mt-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Evento
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Filtrar:</span>
            </div>
            
            <div className="flex flex-wrap gap-4 flex-1">
              {/* Search */}
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-64"
              />
              
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Price Filter */}
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full lg:w-32">
                  <SelectValue placeholder="Preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="gratuito">Gratuito</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ordenar:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="nome">Nome</SelectItem>
                  <SelectItem value="preco">Preço</SelectItem>
                  <SelectItem value="categoria">Categoria</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="p-2"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedEvents.length} evento{filteredAndSortedEvents.length !== 1 ? 's' : ''} encontrado{filteredAndSortedEvents.length !== 1 ? 's' : ''}
            </p>
            
            {/* Active filters */}
            <div className="flex gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm("")}>
                  "{searchTerm}" ✕
                </Badge>
              )}
              {categoryFilter !== "todos" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategoryFilter("todos")}>
                  {categoryFilter} ✕
                </Badge>
              )}
              {priceFilter !== "todos" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setPriceFilter("todos")}>
                  {priceFilter} ✕
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {eventsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                      <div className="text-right">
                        <div className="h-6 w-12 bg-gray-200 rounded"></div>
                        <div className="h-4 w-8 bg-gray-200 rounded mt-1"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      <div className="h-8 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAndSortedEvents && filteredAndSortedEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredAndSortedEvents.map((event: any) => {
                const CategoryIcon = getCategoryIcon(event.category);
                return (
                  <Card key={event.id} className="bg-gradient-to-br from-background to-muted/30 border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/events/${event.id}`)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-sunset/10 p-3 rounded-xl">
                          <CategoryIcon className="h-6 w-6 text-sunset" />
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-foreground">
                            {formatDate(event.startDate)}
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground mb-2">{event.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2 text-ocean" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2 text-tropical" />
                          <span>{event.startTime} às {event.endTime}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Ticket className="h-4 w-4 mr-2 text-sunset" />
                          <span>{event.ticketPrice}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-ocean to-tropical rounded-full flex items-center justify-center mr-2">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm text-muted-foreground">por {event.producerName}</span>
                        </div>
                        <Button variant="ghost" className="text-ocean hover:text-ocean/80 text-sm">
                          Ver detalhes <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : events && events.length > 0 ? (
            <div className="text-center py-12">
              <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-muted-foreground mb-2">
                Nenhum evento encontrado
              </h3>
              <p className="text-muted-foreground mb-6">
                Não encontramos eventos com os filtros aplicados. Tente ajustar os filtros ou limpar a busca.
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("todos");
                    setPriceFilter("todos");
                  }}
                  variant="outline"
                >
                  Limpar Filtros
                </Button>
                {canCreateEvent && (
                  <Button 
                    onClick={() => setShowEventModal(true)}
                    className="bg-gradient-to-r from-sunset to-ocean text-white hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Evento
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground mb-8">
                Parece que ainda não temos eventos cadastrados no sistema. 
                {canCreateEvent ? ' Que tal cadastrar o primeiro evento?' : ' Nossa equipe está trabalhando para adicionar eventos incríveis em Ubatuba.'}
              </p>
              {canCreateEvent ? (
                <Button 
                  onClick={() => setShowEventModal(true)}
                  className="bg-gradient-to-r from-sunset to-ocean text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Evento
                </Button>
              ) : (
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-sunset text-white hover:bg-sunset/90"
                >
                  Atualizar Página
                </Button>
              )}
            </div>
          )}
          
          {events && events.length > 0 && (
            <div className="text-center">
              <Button className="bg-slate-200 text-slate-700 hover:bg-slate-300">
                <Calendar className="h-4 w-4 mr-2" />
                Ver todos os eventos
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Event Modal */}
      <EventModal 
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
      />
    </div>
  );
}
