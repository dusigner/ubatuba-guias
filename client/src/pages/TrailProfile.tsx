import { useParams, useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import Navigation from "@/components/Navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Mountain, Star, MapPin, Clock, Users, ArrowLeft, Share2,
  Heart, Camera, Gauge, Route, AlertTriangle, TreePine, Compass
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function TrailProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites(user?.id);
  const trailId = params.identifier;

  // Remover verificação obrigatória de autenticação para visualização de trilhas
  // A autenticação só é necessária para ações como favoritar, etc.

  const { data: trail, isLoading: trailLoading, error } = useQuery<any>({
    queryKey: [`/api/trails/${trailId}`],
    retry: false,
    enabled: !!trailId, // Remover condição de autenticação pois a rota é pública
  });

  // Log detalhado para debug
  console.log("=== TRAIL PROFILE DEBUG ===");
  console.log("TrailId:", trailId);
  console.log("Is authenticated:", isAuthenticated);
  console.log("Trail loading:", trailLoading);
  console.log("Trail data:", trail);
  console.log("Trail error:", error);

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Não autorizado",
      description: "Você foi desconectado. Fazendo login novamente...",
      variant: "destructive",
    });
    setTimeout(() => {
      setTimeout(async () => { const { signInWithGoogle } = await import('@/lib/firebase'); signInWithGoogle(); }, 500);
    }, 500);
    return null;
  }

  if (trailLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ocean"></div>
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Trilha não encontrada</h1>
          <Button onClick={() => setLocation("/trails")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Trilhas
          </Button>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'fácil':
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'moderada':
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'difícil':
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/20 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'fácil':
      case 'easy':
        return '🟢';
      case 'moderada':
      case 'moderate':
        return '🟡';
      case 'difícil':
      case 'hard':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${trail.name} - Trilha em Ubatuba`,
        text: `Conheça a trilha ${trail.name} em Ubatuba - ${trail.difficulty}, ${trail.distance}km`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link da trilha foi copiado para a área de transferência",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header simplificado com botão voltar */}
      <div className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-md bg-background/95">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/trails")}
              className="flex items-center gap-2 text-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Trilhas
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/")}
                className="text-sm text-foreground hover:text-foreground"
              >
                Ubatuba Guias
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
              src={trail.imageUrl || 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400'}
              alt={trail.name}
              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-4xl font-bold mb-2">{trail.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getDifficultyColor(trail.difficulty)}`}>
                    <span>{getDifficultyIcon(trail.difficulty)}</span>
                    <span className="font-medium">{trail.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/90">
                    <Route className="h-4 w-4" />
                    <span>{trail.distance} km</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/90">
                    <Clock className="h-4 w-4" />
                    <span>{trail.duration}h</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(parseFloat(trail.rating) || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-white/50'
                      }`}
                    />
                  ))}
                  <span className="text-lg font-semibold">{trail.rating || '0.0'}</span>
                  <span className="text-white/90">
                    ({trail.reviewCount || 0} avaliações)
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
                  <Mountain className="h-5 w-5 text-primary" />
                  Sobre a Trilha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer
                  content={trail.description}
                  className="text-muted-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                />
              </CardContent>
            </Card>

            {/* Destaques */}
            {trail.highlights && trail.highlights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Principais Atrações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {trail.highlights.map((highlight: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-blue-800 dark:text-blue-300">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Equipamentos */}
            {trail.equipment && trail.equipment.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    Equipamentos Recomendados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {trail.equipment.map((item: string, index: number) => (
                      <Badge key={index} variant="secondary" className="justify-center py-2">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dicas de Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Dicas de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-700">Sempre informe alguém sobre seu roteiro e horário previsto de retorno</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <TreePine className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-700">Respeite a fauna e flora local - não retire nada da natureza</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <Users className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700">Para trilhas difíceis, recomendamos contratar um guia local</span>
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
                  <Mountain className="h-5 w-5 text-primary" />
                  Informações da Trilha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Distância</span>
                  <span className="font-bold text-tropical">{trail.distance} km</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Duração</span>
                  <span className="font-bold text-ocean">{trail.duration} horas</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Dificuldade</span>
                  <Badge className={getDifficultyColor(trail.difficulty)}>
                    {getDifficultyIcon(trail.difficulty)} {trail.difficulty}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Localização</span>
                  <span className="font-bold text-slate-800">{trail.location}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Avaliação</span>
                  <span className="font-bold text-yellow-600">{trail.rating || '0.0'} ⭐</span>
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
                    onClick={() => toggleFavorite('trail', trailId)}
                    disabled={isToggling}
                    variant={isFavorite('trail', trailId) ? "default" : "outline"}
                    className="w-full"
                  >
                    <Heart 
                      className={`h-4 w-4 mr-2 ${
                        isFavorite('trail', trailId) ? 'fill-current' : ''
                      }`} 
                    />
                    {isFavorite('trail', trailId) ? 'Favoritado' : 'Favoritar'}
                  </Button>
                  <Button 
                    onClick={() => setLocation("/guides")}
                    className="w-full btn-gradient-ocean-tropical"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Contratar Guia
                  </Button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Dica:</strong> Esta trilha faz parte do sistema de trilhas do Parque Estadual da Serra do Mar.
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