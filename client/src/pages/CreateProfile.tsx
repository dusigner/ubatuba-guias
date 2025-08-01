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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Users,
} from "lucide-react";
import { formatPhone, formatPrice } from "@/lib/masks";

// Schemas para validação
const touristProfileSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  location: z.string().min(1, "Localização é obrigatória"),
});

const guideProfileSchema = z.object({
  phone: z.string().min(1, "Telefone é obrigatório"),
  bio: z.string().min(50, "Biografia deve ter pelo menos 50 caracteres"),
  specialties: z.string().min(1, "Especialidades são obrigatórias"),
  experience: z.string().min(1, "Experiência é obrigatória"),
  languages: z.string().min(1, "Idiomas são obrigatórios"),
  hourlyRate: z.string().min(1, "Valor do serviço é obrigatório"),
  location: z.string().min(1, "Localização é obrigatória"),
  availability: z.string().min(1, "Disponibilidade é obrigatória"),
  certifications: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
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

type ProfileType =
  | "tourist"
  | "guide"
  | "event_producer"
  | "boat_tour_operator";

export default function CreateProfile() {
  const [match, params] = useRoute("/create-profile/:type");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const profileType = params?.type as ProfileType;

  // Configurações específicas por tipo
  const getProfileConfig = (type: ProfileType) => {
    switch (type) {
      case "tourist":
        return {
          title: "Perfil de Turista",
          description:
            "Complete seu perfil básico para começar a explorar Ubatuba",
          icon: User,
          color: "from-blue-500 to-cyan-600",
          schema: touristProfileSchema,
        };
      case "guide":
        return {
          title: "Perfil de Guia Local",
          description:
            "Crie um perfil profissional completo para atrair turistas",
          icon: MapPin,
          color: "from-green-500 to-emerald-600",
          schema: guideProfileSchema,
        };
      case "event_producer":
        return {
          title: "Perfil de Produtor de Eventos",
          description:
            "Configure seu perfil para começar a criar eventos incríveis",
          icon: Calendar,
          color: "from-purple-500 to-violet-600",
          schema: eventProducerProfileSchema,
        };
      case "boat_tour_operator":
        return {
          title: "Perfil de Operador de Passeios",
          description:
            "Configure seu perfil para oferecer experiências náuticas",
          icon: Ship,
          color: "from-cyan-500 to-blue-600",
          schema: boatTourOperatorProfileSchema,
        };
      default:
        return {
          title: "Perfil de Turista",
          description:
            "Complete seu perfil básico para começar a explorar Ubatuba",
          icon: User,
          color: "from-blue-500 to-cyan-600",
          schema: touristProfileSchema,
        };
    }
  };

  const config = profileType
    ? getProfileConfig(profileType)
    : getProfileConfig("tourist");

  const getDefaultValues = (type: ProfileType) => {
    switch (type) {
      case "tourist":
        return {
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          phone: user?.phone || "",
          location: user?.location || "",
        };
      case "guide":
        return {
          phone: user?.phone || "",
          bio: "",
          location: user?.location || "",
          specialties: "",
          experience: "",
          languages: "Português",
          hourlyRate: "",
          availability: "",
          certifications: "",
          whatsapp: "",
          instagram: "",
        };
      case "event_producer":
        return {
          phone: user?.phone || "",
          bio: "",
          location: user?.location || "",
          companyName: "",
          eventTypes: "",
          experience: "",
        };
      case "boat_tour_operator":
        return {
          phone: user?.phone || "",
          bio: "",
          location: user?.location || "",
          companyName: "",
          boatTypes: "",
          capacity: "",
          experience: "",
          licenses: "",
        };
      default:
        return {
          phone: "",
          bio: "",
          location: "",
        };
    }
  };

  const form = useForm<any>({
    resolver: zodResolver(config.schema),
    defaultValues: getDefaultValues(profileType || "tourist"),
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Enviando requisição para criar perfil:", {
        ...data,
        userType: profileType || "tourist",
        isProfileComplete: true,
      });
      return apiRequest("/api/profile", "POST", {
        ...data,
        userType: profileType || "tourist",
        isProfileComplete: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Perfil criado com sucesso!",
        description:
          "Você pode agora explorar todas as funcionalidades da plataforma.",
      });
      console.log("Perfil criado, redirecionando para home");
      
      // Force refresh user data then redirect
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Wait a bit for queries to update then redirect to home
      setTimeout(() => {
        console.log("Redirecionando para home após perfil completo");
        setLocation("/");
      }, 500);
    },
    onError: (error) => {
      console.error("Erro ao criar perfil:", error);
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/");
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

  // Redirect se não há match ou tipo inválido - AFTER all hooks
  useEffect(() => {
    if (
      !match ||
      !["tourist", "guide", "event_producer", "boat_tour_operator"].includes(
        profileType,
      )
    ) {
      setLocation("/profile-selection");
    }
  }, [match, profileType, setLocation]);

  // Only render null AFTER all hooks have been called
  if (
    !match ||
    !["tourist", "guide", "event_producer", "boat_tour_operator"].includes(
      profileType,
    )
  ) {
    return null;
  }

  const onSubmit = (data: any) => {
    console.log("=== FORM SUBMISSION START ===");
    console.log("Submitting profile data:", data);
    console.log("Profile type:", profileType);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    console.log("Form data:", form.getValues());
    console.log("Mutation pending:", createProfileMutation.isPending);
    console.log("=== CALLING MUTATION ===");
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
              onClick={() => setLocation("/profile-selection")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center`}
              >
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
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center`}
                >
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                Complete seu perfil
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Campos comuns para todos */}
                  {profileType !== "tourist" && (
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
                                onChange={(e) => {
                                  const formatted = formatPhone(e.target.value);
                                  field.onChange(formatted);
                                }}
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
                  {profileType === "tourist" && (
                    <>
                      {/* Email não editável */}
                      <div className="bg-muted/30 p-4 rounded-lg border">
                        <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email (não editável)
                        </h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>

                      {/* Nome editável */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Nome
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Seu nome" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Sobrenome
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Seu sobrenome" 
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
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Telefone
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="(12) 99999-9999" 
                                {...field}
                                onChange={(e) => {
                                  const formatted = formatPhone(e.target.value);
                                  field.onChange(formatted);
                                }}
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
                            <FormLabel className="flex items-center gap-2">
                              <MapIcon className="h-4 w-4" />
                              Localização
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: São Paulo, SP"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Guia */}
                  {profileType === "guide" && (
                    <>
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
                                placeholder="Ex: Trilhas, História Local, Ecoturismo..."
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
                              <Textarea
                                placeholder="Descreva sua experiência como guia turístico..."
                                rows={3}
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
                          name="availability"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Disponibilidade
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione sua disponibilidade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="todos_os_dias">
                                    Todos os dias
                                  </SelectItem>
                                  <SelectItem value="fins_de_semana">
                                    Fins de semana
                                  </SelectItem>
                                  <SelectItem value="dias_uteis">
                                    Dias úteis
                                  </SelectItem>
                                  <SelectItem value="por_agendamento">
                                    Por agendamento
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Valor do serviço
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: R$ 150,00 por passeio"
                                {...field}
                                onChange={(e) => {
                                  const formatted = `R$ ${formatPrice(e.target.value)}`;
                                  field.onChange(formatted);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="certifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Certificações (opcional)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Descreva suas certificações, cursos ou qualificações relevantes..."
                                rows={2}
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
                          name="whatsapp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                WhatsApp (opcional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="(12) 99999-9999"
                                  {...field}
                                  onChange={(e) => {
                                    const formatted = formatPhone(
                                      e.target.value,
                                    );
                                    field.onChange(formatted);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="instagram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Instagram (opcional)
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="@seuinstagram" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {profileType === "event_producer" && (
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

                  {profileType === "boat_tour_operator" && (
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
                      onClick={() => setLocation("/profile-selection")}
                      className="flex-1"
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProfileMutation.isPending}
                      className={`flex-1 bg-gradient-to-r ${config.color} text-white hover:opacity-90`}
                      onClick={(e) => {
                        console.log("Button clicked, form valid:", form.formState.isValid);
                        console.log("Button disabled:", createProfileMutation.isPending);
                        console.log("Form errors:", form.formState.errors);
                        if (!form.formState.isValid) {
                          console.log("Form invalid, preventing submission");
                          e.preventDefault();
                          form.trigger(); // Trigger validation
                        }
                      }}
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
