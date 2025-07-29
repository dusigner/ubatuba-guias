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
  const [step, setStep] = useState<'preferences' | 'generating' | 'result'>('preferences');
  const [generatedItinerary, setGeneratedItinerary] = useState<any>(null);

  // Form state estruturado
  const [experienceTypes, setExperienceTypes] = useState<string[]>(['praias']);
  const [duration, setDuration] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [travelStyle, setTravelStyle] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const generateMutation = useMutation({
    mutationFn: async (preferences: any) => {
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
      setStep('preferences');
    },
  });

  const handleExperienceTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setExperienceTypes([...experienceTypes, type]);
    } else {
      setExperienceTypes(experienceTypes.filter(t => t !== type));
    }
  };

  const handleGenerateItinerary = () => {
    if (experienceTypes.length === 0 || !duration || !budget || !travelStyle) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setStep('generating');
    
    const preferences = {
      duration: parseInt(duration),
      interests: experienceTypes,
      budget,
      travelStyle,
      specialRequests: specialRequests || undefined
    };
    
    generateMutation.mutate(preferences);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('preferences');
    setGeneratedItinerary(null);
    // Reset form
    setExperienceTypes(['praias']);
    setDuration('');
    setBudget('');
    setTravelStyle('');
    setSpecialRequests('');
  };

  const experienceOptions = [
    { value: 'praias', label: 'Praias', icon: '🏖️' },
    { value: 'trilhas', label: 'Trilhas', icon: '🥾' },
    { value: 'mergulho', label: 'Mergulho', icon: '🤿' },
    { value: 'culinária', label: 'Culinária', icon: '🍽️' },
    { value: 'vida noturna', label: 'Vida Noturna', icon: '🌙' },
    { value: 'história', label: 'História', icon: '🏛️' },
    { value: 'natureza', label: 'Natureza', icon: '🌿' },
    { value: 'fotografia', label: 'Fotografia', icon: '📸' }
  ];

  const renderContent = () => {
    switch (step) {
      case 'preferences':
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

            {/* Tipos de Experiência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  O que você gostaria de fazer? *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {experienceOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={option.value}
                        checked={experienceTypes.includes(option.value)}
                        onChange={(e) => handleExperienceTypeChange(option.value, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label 
                        htmlFor={option.value} 
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span>{option.icon}</span>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Duração */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Quantos dias você tem? *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-background"
                >
                  <option value="">Selecione a duração</option>
                  <option value="1">1 dia</option>
                  <option value="2">2 dias</option>
                  <option value="3">3 dias</option>
                  <option value="4">4 dias</option>
                  <option value="5">5 dias</option>
                  <option value="7">1 semana</option>
                  <option value="10">10 dias</option>
                  <option value="14">2 semanas</option>
                </select>
              </CardContent>
            </Card>

            {/* Orçamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>💰</span>
                  Qual seu orçamento? *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-background"
                >
                  <option value="">Selecione o orçamento</option>
                  <option value="econômico">Econômico (até R$ 200/dia)</option>
                  <option value="médio">Médio (R$ 200-500/dia)</option>
                  <option value="alto">Alto (acima de R$ 500/dia)</option>
                </select>
              </CardContent>
            </Card>

            {/* Estilo de Viagem */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🎯</span>
                  Qual seu estilo de viagem? *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-background"
                >
                  <option value="">Selecione o estilo</option>
                  <option value="aventura">Aventura</option>
                  <option value="relaxante">Relaxante</option>
                  <option value="cultural">Cultural</option>
                  <option value="família">Família</option>
                  <option value="romântico">Romântico</option>
                  <option value="mochileiro">Mochileiro</option>
                </select>
              </CardContent>
            </Card>

            {/* Pedidos Especiais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>✨</span>
                  Algum pedido especial?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ex: Somos vegetarianos, queremos locais pet-friendly, temos dificuldade de locomoção..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
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
                  setStep('preferences');
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