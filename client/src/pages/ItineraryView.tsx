import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Share2, Download, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ItineraryRenderer from "@/components/ItineraryRenderer";

export default function ItineraryView() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const itineraryId = params.id;

  const { data: itinerary, isLoading, error } = useQuery<any>({
    queryKey: ["/api/itineraries", itineraryId],
    enabled: !!itineraryId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando roteiro...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Roteiro não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O roteiro que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => setLocation('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: itinerary.title || 'Roteiro para Ubatuba',
        text: 'Confira este roteiro personalizado para Ubatuba!',
        url: window.location.href
      });
    } catch (error) {
      // Fallback para copiar URL
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link do roteiro foi copiado para a área de transferência.",
      });
    }
  };

  const handleDownload = () => {
    const content = `
${itinerary.title || 'Roteiro para Ubatuba'}
Duração: ${itinerary.duration} ${itinerary.duration === 1 ? 'dia' : 'dias'}
Criado em: ${new Date(itinerary.createdAt).toLocaleDateString('pt-BR')}

${itinerary.content}

---
Roteiro criado pelo UbatubaIA - Sua plataforma de turismo inteligente
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roteiro-ubatuba-${itinerary.duration}-dias.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Roteiro baixado!",
      description: "O arquivo foi salvo em seus downloads.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {itinerary.title || 'Roteiro para Ubatuba'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {itinerary.duration} {itinerary.duration === 1 ? 'dia' : 'dias'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Criado em {new Date(itinerary.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <ItineraryRenderer 
          content={itinerary.content || ''}
          title={itinerary.title || 'Roteiro Personalizado'}
          duration={itinerary.duration || 1}
        />
      </div>
    </div>
  );
}