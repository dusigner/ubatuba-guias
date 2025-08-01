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
import { Sparkles, Loader2, MapPin, Clock, Star, Wand2, Calendar, Users } from "lucide-react";
import ItineraryRenderer from "./ItineraryRenderer";

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
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [travelStyle, setTravelStyle] = useState<string>('');
  const [groupSize, setGroupSize] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const generateMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const generateResponse = await apiRequest('/api/itineraries/generate', 'POST', { preferences });
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
        setTimeout(async () => {
          const { signInWithGoogle } = await import('@/lib/firebase');
          signInWithGoogle();
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

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleGenerateItinerary = () => {
    const duration = calculateDuration();
    
    if (experienceTypes.length === 0 || !startDate || !endDate || !budget || !travelStyle || !groupSize) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (duration <= 0) {
      toast({
        title: "Datas inválidas",
        description: "A data de fim deve ser após a data de início.",
        variant: "destructive",
      });
      return;
    }

    setStep('generating');
    
    const preferences = {
      duration,
      startDate,
      endDate,
      interests: experienceTypes,
      budget,
      travelStyle,
      groupSize,
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
    setStartDate('');
    setEndDate('');
    setBudget('');
    setTravelStyle('');
    setGroupSize('');
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
                        onChange={(e) => handleExperienceTypeChange(option.value, (e.target as HTMLInputElement).checked)}
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

            {/* Datas da Viagem */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Quando você estará em Ubatuba? *
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date" className="text-sm font-medium">
                      Data de Chegada
                    </Label>
                    <input
                      type="date"
                      id="start-date"
                      value={startDate}
                      onChange={(e) => setStartDate((e.target as HTMLInputElement).value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border rounded-lg bg-background mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-sm font-medium">
                      Data de Saída
                    </Label>
                    <input
                      type="date"
                      id="end-date"
                      value={endDate}
                      onChange={(e) => setEndDate((e.target as HTMLInputElement).value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border rounded-lg bg-background mt-1"
                    />
                  </div>
                </div>
                {startDate && endDate && (
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      📅 Duração da viagem: {calculateDuration()} {calculateDuration() === 1 ? 'dia' : 'dias'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tamanho do Grupo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Quantas pessoas? *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={groupSize}
                  onChange={(e) => setGroupSize((e.target as HTMLSelectElement).value)}
                  className="w-full p-3 border rounded-lg bg-background"
                >
                  <option value="">Selecione o tamanho do grupo</option>
                  <option value="1">Sozinho</option>
                  <option value="2">Casal</option>
                  <option value="3-4">Grupo pequeno (3-4 pessoas)</option>
                  <option value="5-8">Grupo médio (5-8 pessoas)</option>
                  <option value="9+">Grupo grande (9+ pessoas)</option>
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
                  onChange={(e) => setBudget((e.target as HTMLSelectElement).value)}
                  className="w-full p-3 border rounded-lg bg-background"
                >
                  <option value="">Selecione o orçamento</option>
                  <option value="econômico">💰 Econômico (até R$ 200/dia por pessoa)</option>
                  <option value="médio">💎 Médio (R$ 200-500/dia por pessoa)</option>
                  <option value="alto">👑 Premium (acima de R$ 500/dia por pessoa)</option>
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
                  onChange={(e) => setTravelStyle((e.target as HTMLSelectElement).value)}
                  className="w-full p-3 border rounded-lg bg-background"
                >
                  <option value="">Selecione o estilo</option>
                  <option value="aventura">🏔️ Aventura</option>
                  <option value="relaxante">🧘 Relaxante</option>
                  <option value="cultural">🎭 Cultural</option>
                  <option value="família">👨‍👩‍👧‍👦 Família</option>
                  <option value="romântico">💕 Romântico</option>
                  <option value="mochileiro">🎒 Mochileiro</option>
                  <option value="luxo">✨ Luxo</option>
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
                  placeholder="Ex: Somos vegetarianos, queremos locais pet-friendly, temos dificuldade de locomoção, preferimos atividades pela manhã, não sabemos nadar..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests((e.target as HTMLTextAreaElement).value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  💡 Dica: Quanto mais detalhes, melhor será seu roteiro personalizado!
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

            <ItineraryRenderer 
              content={generatedItinerary?.content || ''}
              title={generatedItinerary?.title || 'Roteiro Personalizado'}
              duration={generatedItinerary?.duration || 1}
            />

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