import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  User, 
  MapPin, 
  Calendar, 
  Ship, 
  Compass,
  ArrowLeft,
  CheckCircle,
  Phone,
  Mail,
  MapIcon,
  Star,
  DollarSign,
  Clock,
  Users
} from "lucide-react";

// Schemas para validação
const touristProfileSchema = z.object({
  phone: z.string().min(1, "Telefone é obrigatório"),
  bio: z.string().min(20, "Biografia deve ter pelo menos 20 caracteres"),
  interests: z.string().min(1, "Interesses são obrigatórios"),
  travelStyle: z.string().min(1, "Estilo de viagem é obrigatório"),
  budget: z.string().min(1, "Orçamento é obrigatório"),
  location: z.string().min(1, "Localização é obrigatória"),
});

const guideProfileSchema = z.object({
  phone: z.string().min(1, "Telefone é obrigatório"),
  bio: z.string().min(50, "Biografia deve ter pelo menos 50 caracteres"),
  specialties: z.string().min(1, "Especialidades são obrigatórias"),
  experience: z.string().min(1, "Experiência é obrigatória"),
  languages: z.string().min(1, "Idiomas são obrigatórios"),
  hourlyRate: z.string().min(1, "Valor por hora é obrigatório"),
  location: z.string().min(1, "Localização é obrigatória"),
});

const eventProducerProfileSchema = z.object({
  phone: z.string().min(1, "Telefone é obrigatório"),
  bio: z.string().min(50, "Biografia deve ter pelo menos 50 caracteres"),
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  eventTypes: z.string().min(1, "Tipos de eventos são obrigatórios"),
  experience: z.string().min(1, "Experiência é obrigatória"),
  location: z.string().min(1, "Localização é obrigatória"),
});

const boatTourOperatorProfileSchema = z.object({
  phone: z.string().min(1, "Telefone é obrigatório"),
  bio: z.string().min(50, "Biografia deve ter pelo menos 50 caracteres"),
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  boatTypes: z.string().min(1, "Tipos de embarcação são obrigatórios"),
  capacity: z.string().min(1, "Capacidade é obrigatória"),
  experience: z.string().min(1, "Experiência é obrigatória"),
  location: z.string().min(1, "Localização é obrigatória"),
  licenses: z.string().min(1, "Licenças são obrigatórias"),
});

type ProfileType = 'tourist' | 'guide' | 'event_producer' | 'boat_tour_operator';

export default function CreateProfile() {
  const [match, params] = useRoute("/create-profile/:type");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const profileType = params?.type as ProfileType;

  // Redirect se não há match ou tipo inválido
  useEffect(() => {
    if (!match || !['tourist', 'guide', 'event_producer', 'boat_tour_operator'].includes(profileType)) {
      setLocation('/profile-selection');
    }
  }, [match, profileType, setLocation]);

  // Configurações específicas por tipo
  const getProfileConfig = (type: ProfileType) => {
    switch (type) {
      case 'tourist':
        return {
          title: 'Perfil de Turista',
          description: 'Complete seu perfil básico para começar a explorar Ubatuba',
          icon: User,
          color: 'from-blue-500 to-cyan-600',
          schema: touristProfileSchema
        };
      case 'guide':
        return {
          title: 'Perfil de Guia Local',
          description: 'Crie um perfil profissional completo para atrair turistas',
          icon: MapPin,
          color: 'from-green-500 to-emerald-600',
          schema: guideProfileSchema
        };
      case 'event_producer':
        return {
          title: 'Perfil de Produtor de Eventos',
          description: 'Configure seu perfil para começar a criar eventos incríveis',
          icon: Calendar,
          color: 'from-purple-500 to-violet-600',
          schema: eventProducerProfileSchema
        };
      case 'boat_tour_operator':
        return {
          title: 'Perfil de Operador de Passeios',
          description: 'Configure seu perfil para oferecer experiências náuticas',
          icon: Ship,
          color: 'from-cyan-500 to-blue-600',
          schema: boatTourOperatorProfileSchema
        };
      default:
        return null;
    }
  };

  const config = profileType ? getProfileConfig(profileType) : null;
  
  if (!config) {
    return null;
  }

  const getDefaultValues = (type: ProfileType) => {
    const baseDefaults = {
      phone: "",
      bio: "",
      location: "",
    };

    switch (type) {
      case 'tourist':
        return {
          ...baseDefaults,
          interests: "",
          travelStyle: "",
          budget: "",
        };
      case 'guide':
        return {
          ...baseDefaults,
          specialties: "",
          experience: "",
          languages: "Português",
          hourlyRate: "",
        };
      case 'event_producer':
        return {
          ...baseDefaults,
          companyName: "",
          eventTypes: "",
          experience: "",
        };
      case 'boat_tour_operator':
        return {
          ...baseDefaults,
          companyName: "",
          boatTypes: "",
          capacity: "",
          experience: "",
          licenses: "",
        };
      default:
        return baseDefaults;
    }
  };

  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: getDefaultValues(profileType),
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/profile', 'POST', {
        ...data,
        userType: profileType,
        isProfileComplete: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Perfil criado com sucesso!",
        description: "Você pode agora explorar todas as funcionalidades da plataforma.",
      });
      setLocation('/');
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
        title: "Erro",
        description: "Não foi possível criar o perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createProfileMutation.mutate(data);
  };

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean/5 via-white to-sunset/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/profile-selection')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center`}>
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {config.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {config.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                Complete seu perfil
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Campos comuns para todos */}
                  {profileType !== 'tourist' && (
                    <>
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Telefone/WhatsApp
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="(12) 99999-9999" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Biografia
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Conte um pouco sobre você e sua experiência..." 
                                rows={4}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Campos específicos por tipo */}
                  {profileType === 'tourist' && (
                    <>
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Telefone (opcional)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="(12) 99999-9999" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Sobre você
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Conte um pouco sobre você e seus interesses de viagem..." 
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="interests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Compass className="h-4 w-4" />
                              Interesses
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Praias, Trilhas, História, Gastronomia..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="travelStyle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estilo de viagem</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione seu estilo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="aventura">Aventura</SelectItem>
                                  <SelectItem value="relaxante">Relaxante</SelectItem>
                                  <SelectItem value="cultural">Cultural</SelectItem>
                                  <SelectItem value="gastronomico">Gastronômico</SelectItem>
                                  <SelectItem value="familiar">Familiar</SelectItem>
                                  <SelectItem value="romantico">Romântico</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Orçamento por dia
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione seu orçamento" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="economico">Econômico (até R$ 100)</SelectItem>
                                  <SelectItem value="medio">Médio (R$ 100-300)</SelectItem>
                                  <SelectItem value="premium">Premium (R$ 300-500)</SelectItem>
                                  <SelectItem value="luxo">Luxo (acima de R$ 500)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <MapIcon className="h-4 w-4" />
                              Localização
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: São Paulo, Rio de Janeiro..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {profileType === 'guide' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="specialties"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Especialidades
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Trilhas, História, Cultura..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Experiência
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: 5 anos como guia..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="languages"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Idiomas</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Português, Inglês, Espanhol..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hourlyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Valor por hora (R$)
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: 50,00" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <MapIcon className="h-4 w-4" />
                              Localização base
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Centro de Ubatuba, Praia Grande..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {profileType === 'event_producer' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Empresa</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Eventos Ubatuba Ltda" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="eventTypes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipos de Eventos</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Música, Cultura, Esporte..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Experiência</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: 3 anos organizando eventos..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Localização</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Ubatuba e região..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {profileType === 'boat_tour_operator' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Empresa</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Passeios Marítimos Ubatuba" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="boatTypes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipos de Embarcação</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Lancha, Veleiro, Catamarã..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Capacidade máxima
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: 12 pessoas" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Experiência</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: 10 anos navegando..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Porto base</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Marina Ubatuba..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="licenses"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Licenças/Certificações</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Arrais Amador, Capitão..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation('/profile-selection')}
                      className="flex-1"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProfileMutation.isPending}
                      className={`flex-1 bg-gradient-to-r ${config.color} text-white hover:opacity-90`}
                    >
                      {createProfileMutation.isPending ? (
                        "Criando perfil..."
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Finalizar perfil
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}