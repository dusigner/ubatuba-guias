import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, MapPin, Clock, Star, Wand2 } from "lucide-react";

interface AIItineraryProps {
  children: React.ReactNode;
}

export default function AIItinerary({ children }: AIItineraryProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'input' | 'generating' | 'result'>('input');
  const [generatedItinerary, setGeneratedItinerary] = useState<any>(null);
  const [userInput, setUserInput] = useState<string>('');

  const generateMutation = useMutation({
    mutationFn: async (userInput: string) => {
      // Primeiro analisa as preferências
      const analyzeResponse = await apiRequest('POST', '/api/itineraries/analyze', { userInput });
      const preferences = await analyzeResponse.json();
      
      // Depois gera o roteiro
      const generateResponse = await apiRequest('POST', '/api/itineraries/generate', { preferences });
      return generateResponse.json();
    },
    onSuccess: (data) => {
      setGeneratedItinerary(data);
      setStep('result');
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries'] });
      toast({
        title: "✨ Roteiro criado com Gemini AI!",
        description: "Seu roteiro personalizado foi gerado com inteligência artificial gratuita.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Erro ao gerar roteiro",
        description: "Não foi possível gerar o roteiro. Tente novamente.",
        variant: "destructive",
      });
      setStep('input');
    },
  });

  const handleGenerateItinerary = () => {
    if (!userInput.trim()) {
      toast({
        title: "Descreva sua viagem",
        description: "Por favor, conte-nos o que você gostaria de fazer em Ubatuba.",
        variant: "destructive",
      });
      return;
    }

    setStep('generating');
    generateMutation.mutate(userInput);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('input');
    setGeneratedItinerary(null);
    setUserInput('');
  };

  const renderContent = () => {
    switch (step) {
      case 'input':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full">
                  <Wand2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Powered by Google Gemini AI 🚀
              </h3>
              <p className="text-muted-foreground">
                Roteiros personalizados com IA gratuita e inteligente
              </p>
            </div>

            <Card className="border-2 border-dashed border-primary/20">
              <CardContent className="p-6">
                <Label htmlFor="travel-description" className="text-lg font-semibold">
                  Conte-nos sobre sua viagem dos sonhos em Ubatuba:
                </Label>
                <Textarea
                  id="travel-description"
                  placeholder="Ex: Quero passar 3 dias em Ubatuba com minha família. Gostamos de praias, trilhas leves e boa comida. Temos orçamento médio e gostaríamos de conhecer o melhor da região..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="mt-3 min-h-[120px] resize-none"
                />
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Locais específicos
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duração da viagem
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Seus interesses
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Estilo de viagem
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleGenerateItinerary}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white text-lg py-6"
              size="lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Criar Roteiro com Gemini AI
            </Button>
          </div>
        );

      case 'generating':
        return (
          <div className="text-center py-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full animate-pulse">
                  <Wand2 className="h-10 w-10 text-white" />
                </div>
                <Loader2 className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-spin" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Gemini AI está criando seu roteiro...
            </h3>
            <p className="text-muted-foreground mb-4">
              Analisando suas preferências e criando um roteiro personalizado para Ubatuba
            </p>
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
              <p>✨ Usando inteligência artificial gratuita do Google</p>
              <p>🔍 Analisando lugares específicos de Ubatuba</p>
              <p>📝 Criando roteiro detalhado dia por dia</p>
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-500 p-3 rounded-full">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Seu Roteiro Está Pronto! 🎉
              </h3>
              <p className="text-muted-foreground">
                Criado com Gemini AI especialmente para você
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Roteiro Personalizado para Ubatuba
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div 
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: generatedItinerary?.content?.replace(/\n/g, '<br>') || 'Roteiro não disponível'
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setStep('input');
                  setUserInput('');
                  setGeneratedItinerary(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Criar Novo Roteiro
              </Button>
              <Button 
                onClick={handleClose}
                className="flex-1"
              >
                Salvar e Fechar
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Roteiro Inteligente com Gemini AI
          </DialogTitle>
          <DialogDescription>
            Crie roteiros personalizados para Ubatuba usando inteligência artificial gratuita
          </DialogDescription>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}