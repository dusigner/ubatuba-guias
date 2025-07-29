import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mountain, Clock, Route, TrendingUp, Star, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Trails() {
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

  const { data: trails = [], isLoading: trailsLoading, error } = useQuery<any[]>({
    queryKey: ["/api/trails"],
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'fácil':
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderado':
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'difícil':
      case 'difficult':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
              <Mountain className="inline h-12 w-12 text-tropical mr-4" />
              Trilhas de Ubatuba
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore as melhores trilhas da região com dicas especializadas, níveis de dificuldade e avaliações de outros aventureiros
            </p>
          </div>
        </div>
      </section>

      {/* Trails Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {trailsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="flex space-x-4">
                      <div className="h-3 bg-gray-200 rounded flex-1"></div>
                      <div className="h-3 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trails && trails.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trails.map((trail: any) => (
                <Card key={trail.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative">
                    <img 
                      src={trail.imageUrl || 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'} 
                      alt={trail.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={getDifficultyColor(trail.difficulty)}>
                        {trail.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-slate-800">{trail.name}</h3>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4 text-sm text-slate-600">
                      <span className="flex items-center">
                        <Route className="h-4 w-4 mr-1" />
                        {trail.distance} km
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {Math.floor(trail.duration / 60)}h {trail.duration % 60}min
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {trail.elevation}m
                      </span>
                    </div>
                    
                    <p className="text-slate-600 mb-4 line-clamp-3">
                      {trail.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-slate-600">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{trail.rating || '0.0'} ({trail.reviewCount || 0} avaliações)</span>
                      </div>
                      <Button variant="ghost" className="text-ocean hover:text-ocean/80">
                        Ver detalhes <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Mountain className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Nenhuma trilha encontrada</h3>
              <p className="text-slate-600 mb-8">
                Parece que ainda não temos trilhas cadastradas no sistema. Nossa equipe está trabalhando para adicionar as melhores trilhas de Ubatuba.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-tropical text-white hover:bg-tropical/90"
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
