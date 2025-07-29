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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, MapPin, Clock, Calendar, Users, Utensils, Mountain, Camera, Loader2, ChevronRight } from "lucide-react";

interface ItineraryDay {
  day: number;
  title: string;
  activities: {
    time: string;
    activity: string;
    location: string;
    description: string;
    duration: string;
    difficulty?: string;
    tips: string[];
  }[];
}

interface GeneratedItinerary {
  title: string;
  summary: string;
  totalDays: number;
  estimatedCost: string;
  bestTimeToVisit: string;
  days: ItineraryDay[];
  generalTips: string[];
  whatToBring: string[];
}

interface AIItineraryProps {
  children: React.ReactNode;
}

export default function AIItinerary({ children }: AIItineraryProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'preferences' | 'generating' | 'result'>('preferences');
  const [generatedItinerary, setGeneratedItinerary] = useState<GeneratedItinerary | null>(null);

  // Form state
  const [experienceTypes, setExperienceTypes] = useState<string[]>(['aventura']);
  const [duration, setDuration] = useState<string>('');
  const [styles, setStyles] = useState<string[]>(['aventureiro']);
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const generateMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const response = await apiRequest('POST', '/api/itinerary/generate', preferences);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedItinerary(data);
      setStep('result');
      queryClient.invalidateQueries({ queryKey: ['/api/itineraries'] });
      toast({
        title: "Roteiro criado com sucesso!",
        description: "Seu roteiro personalizado foi gerado pela IA.",
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
        description: "Houve um problema ao gerar seu roteiro. Tente novamente.",
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

  const handleStyleChange = (style: string, checked: boolean) => {
    if (checked) {
      setStyles([...styles, style]);
    } else {
      setStyles(styles.filter(s => s !== style));
    }
  };

  const handleGenerate = () => {
    if (experienceTypes.length === 0 || !duration || styles.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setStep('generating');
    generateMutation.mutate({
      experienceTypes,
      duration,
      styles,
      specialRequests,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('preferences');
    setGeneratedItinerary(null);
    // Reset form
    setExperienceTypes(['aventura']);
    setDuration('');
    setStyles(['aventureiro']);
    setSpecialRequests('');
  };

  const experienceOptions = [
    { value: 'aventura', label: 'Aventura', icon: Mountain },
    { value: 'família', label: 'Família', icon: Users },
    { value: 'praia', label: 'Praia', icon: '🏖️' },
    { value: 'trilhas', label: 'Trilhas', icon: '🥾' },
  ];

  const styleOptions = [
    { value: 'relaxante', label: 'Relaxante', icon: '😌' },
    { value: 'aventureiro', label: 'Aventureiro', icon: '🏃‍♂️' },
    { value: 'cultural', label: 'Cultural', icon: '🏛️' },
    { value: 'gastronômico', label: 'Gastronômico', icon: Utensils },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Sparkles className="h-6 w-6 text-sunset mr-2" />
            Roteiro Personalizado com IA
          </DialogTitle>
          <DialogDescription>
            Nossa inteligência artificial irá criar um roteiro único baseado nas suas preferências
          </DialogDescription>
        </DialogHeader>

        {step === 'preferences' && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-ocean/5 to-tropical/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Configure seu roteiro personalizado</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Experience Types */}
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                        Tipo de experiência *
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {experienceOptions.map((option) => {
                          const IconComponent = typeof option.icon === 'string' ? null : option.icon;
                          return (
                            <div key={option.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`experience-${option.value}`}
                                checked={experienceTypes.includes(option.value)}
                                onCheckedChange={(checked) => 
                                  handleExperienceTypeChange(option.value, checked === true)
                                }
                              />
                              <Label 
                                htmlFor={`experience-${option.value}`}
                                className="flex items-center cursor-pointer"
                              >
                                {IconComponent ? (
                                  <IconComponent className="h-4 w-4 mr-1" />
                                ) : (
                                  <span className="mr-1">{option.icon as string}</span>
                                )}
                                {option.label}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Tempo disponível *
                      </Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a duração" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 dia">1 dia</SelectItem>
                          <SelectItem value="2-3 dias">2-3 dias</SelectItem>
                          <SelectItem value="4-7 dias">4-7 dias</SelectItem>
                          <SelectItem value="mais de 1 semana">Mais de 1 semana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Styles */}
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                        Estilo de passeio *
                      </Label>
                      <div className="space-y-2">
                        {styleOptions.map((option) => {
                          const IconComponent = typeof option.icon === 'string' ? null : option.icon;
                          return (
                            <div key={option.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`style-${option.value}`}
                                checked={styles.includes(option.value)}
                                onCheckedChange={(checked) => 
                                  handleStyleChange(option.value, checked === true)
                                }
                              />
                              <Label 
                                htmlFor={`style-${option.value}`}
                                className="flex items-center cursor-pointer"
                              >
                                {IconComponent ? (
                                  <IconComponent className="h-4 w-4 mr-1" />
                                ) : (
                                  <span className="mr-1">{option.icon as string}</span>
                                )}
                                {option.label}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Pedidos especiais (opcional)
                      </Label>
                      <Textarea
                        placeholder="Descreva qualquer preferência especial ou restrição..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6">
                    <h4 className="font-bold text-slate-800 mb-4">
                      <Sparkles className="inline h-5 w-5 text-sunset mr-2" />
                      Prévia do Roteiro IA
                    </h4>
                    <div className="space-y-4 text-sm">
                      {experienceTypes.includes('aventura') && (
                        <div className="border-l-4 border-tropical pl-4">
                          <div className="font-semibold text-tropical">Manhã - Aventura</div>
                          <div className="text-slate-600">Trilha com vista panorâmica + Atividades outdoor</div>
                        </div>
                      )}
                      {experienceTypes.includes('praia') && (
                        <div className="border-l-4 border-ocean pl-4">
                          <div className="font-semibold text-ocean">Tarde - Praia</div>
                          <div className="text-slate-600">Praia paradisíaca + Esportes aquáticos</div>
                        </div>
                      )}
                      {styles.includes('gastronômico') && (
                        <div className="border-l-4 border-sunset pl-4">
                          <div className="font-semibold text-sunset">Noite - Gastronomia</div>
                          <div className="text-slate-600">Restaurante local + Culinária caiçara</div>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={handleGenerate}
                      disabled={generateMutation.isPending}
                      className="w-full bg-gradient-to-r from-ocean to-tropical text-white hover:opacity-90 mt-6"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Roteiro Completo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'generating' && (
          <div className="text-center py-12">
            <div className="mb-6">
              <Loader2 className="h-16 w-16 text-ocean animate-spin mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Criando seu roteiro personalizado...
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Nossa IA está analisando suas preferências e criando o roteiro perfeito para sua aventura em Ubatuba.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <Sparkles className="h-4 w-4 animate-pulse text-sunset" />
              <span>Isso pode levar alguns segundos...</span>
            </div>
          </div>
        )}

        {step === 'result' && generatedItinerary && (
          <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-ocean/10 to-tropical/10">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {generatedItinerary.title}
                </h3>
                <p className="text-slate-600 mb-4">{generatedItinerary.summary}</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-ocean mr-2" />
                    <div>
                      <div className="font-semibold text-slate-800">{generatedItinerary.totalDays} dias</div>
                      <div className="text-xs text-slate-600">Duração</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">💰</span>
                    <div>
                      <div className="font-semibold text-slate-800">{generatedItinerary.estimatedCost}</div>
                      <div className="text-xs text-slate-600">Custo estimado</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">🌤️</span>
                    <div>
                      <div className="font-semibold text-slate-800">{generatedItinerary.bestTimeToVisit}</div>
                      <div className="text-xs text-slate-600">Melhor época</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Itinerary */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-slate-800">Roteiro Detalhado</h4>
              {generatedItinerary.days.map((day) => (
                <Card key={day.day}>
                  <CardContent className="p-6">
                    <h5 className="text-xl font-bold text-slate-800 mb-4">
                      Dia {day.day} - {day.title}
                    </h5>
                    <div className="space-y-4">
                      {day.activities.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                          <div className="text-sm font-semibold text-ocean min-w-[60px]">
                            {activity.time}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h6 className="font-semibold text-slate-800">{activity.activity}</h6>
                              {activity.difficulty && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.difficulty}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-slate-600 mb-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              {activity.location}
                              <Clock className="h-4 w-4 ml-4 mr-1" />
                              {activity.duration}
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{activity.description}</p>
                            {activity.tips.length > 0 && (
                              <div className="space-y-1">
                                {activity.tips.map((tip, tipIndex) => (
                                  <div key={tipIndex} className="flex items-start text-xs text-slate-500">
                                    <span className="text-tropical mr-1">💡</span>
                                    {tip}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tips and What to Bring */}
            <div className="grid md:grid-cols-2 gap-6">
              {generatedItinerary.generalTips.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h5 className="font-bold text-slate-800 mb-4">Dicas Gerais</h5>
                    <ul className="space-y-2">
                      {generatedItinerary.generalTips.map((tip, index) => (
                        <li key={index} className="flex items-start text-sm text-slate-600">
                          <ChevronRight className="h-4 w-4 text-tropical mr-2 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {generatedItinerary.whatToBring.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h5 className="font-bold text-slate-800 mb-4">O que levar</h5>
                    <ul className="space-y-2">
                      {generatedItinerary.whatToBring.map((item, index) => (
                        <li key={index} className="flex items-start text-sm text-slate-600">
                          <ChevronRight className="h-4 w-4 text-ocean mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
              <Button className="bg-gradient-to-r from-ocean to-tropical text-white hover:opacity-90">
                <span className="mr-2">📱</span>
                Salvar no Celular
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
