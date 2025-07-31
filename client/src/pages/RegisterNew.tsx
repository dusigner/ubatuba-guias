import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { User, Compass, Calendar, Ship, MapPin, ArrowLeft, Mail, Lock, Chrome } from "lucide-react";

type UserType = "tourist" | "guide" | "event_producer" | "boat_operator";

interface UserTypeInfo {
  id: UserType;
  title: string;
  description: string;
  features: string[];
  icon: any;
  color: string;
  bgColor: string;
}

const userTypes: UserTypeInfo[] = [
  {
    id: "tourist",
    title: "Turista",
    description: "Descubra Ubatuba com roteiros personalizados e experiências únicas",
    features: [
      "Roteiros personalizados com IA",
      "Reservas de passeios e trilhas",
      "Avaliações e comentários",
      "Favoritos e planejamento"
    ],
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200"
  },
  {
    id: "guide",
    title: "Guia Local",
    description: "Compartilhe seu conhecimento sobre Ubatuba e guie visitantes",
    features: [
      "Perfil profissional completo",
      "Gestão de agendamentos",
      "Sistema de avaliações",
      "Certificações e especialidades"
    ],
    icon: Compass,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200"
  },
  {
    id: "event_producer",
    title: "Produtor de Eventos",
    description: "Organize e promova eventos incríveis em Ubatuba",
    features: [
      "Cadastro de eventos",
      "Venda de ingressos online",
      "Gestão de participantes",
      "Divulgação e marketing"
    ],
    icon: Calendar,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200"
  },
  {
    id: "boat_operator",
    title: "Operador de Passeios",
    description: "Ofereça seus passeios de barco, pesca esportiva e experiências marítimas",
    features: [
      "Cadastro de embarcações",
      "Gestão de horários e preços",
      "Sistema de reservas online",
      "Certificações de segurança"
    ],
    icon: Ship,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 border-cyan-200"
  }
];

export default function RegisterNew() {
  const [step, setStep] = useState<"auth" | "userType" | "details">("auth");
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    specialties: "",
    experience: "",
    services: "",
    certifications: "",
    equipment: "",
    pricing: "",
    availability: "",
    company: "",
    location: ""
  });
  
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.isProfileComplete) {
        navigate("/");
      } else {
        // Se o usuário está logado mas perfil não está completo, mostrar seleção de tipo
        setStep("userType");
      }
    } else if (!isAuthenticated && !isLoading) {
      // Se não está autenticado, mostrar formulário de auth
      setStep("auth");
    }
  }, [isAuthenticated, user, navigate]);

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/auth/register", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Conta criada com sucesso!",
        description: "Agora escolha seu tipo de perfil.",
      });
      setStep("userType");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/auth/login", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setStep("userType");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais",
        variant: "destructive",
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/profile/complete", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Perfil criado com sucesso!",
        description: "Bem-vindo ao UbatubaIA!",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar perfil",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    }
  });

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "register") {
      registerMutation.mutate({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
    } else {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password
      });
    }
  };

  const handleTypeSelect = (type: UserType) => {
    setSelectedType(type);
    if (type === "tourist") {
      updateProfileMutation.mutate({
        userType: type,
        isProfileComplete: true
      });
    } else {
      setStep("details");
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    updateProfileMutation.mutate({
      userType: selectedType,
      phone: formData.phone,
      bio: formData.bio,
      specialties: formData.specialties,
      experience: formData.experience,
      services: formData.services,
      certifications: formData.certifications,
      equipment: formData.equipment,
      pricing: formData.pricing,
      availability: formData.availability,
      company: formData.company,
      location: formData.location,
      isProfileComplete: true
    });
  };

  const renderAuthForm = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Compass className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">
            {authMode === "register" ? "Criar Conta" : "Entrar"}
          </CardTitle>
          <CardDescription>
            {authMode === "register" 
              ? "Junte-se à comunidade UbatubaIA" 
              : "Acesse sua conta UbatubaIA"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Login com Google */}
          <Button
            onClick={() => window.location.href = '/firebase-login'}
            variant="outline"
            className="w-full flex items-center justify-center space-x-2"
          >
            <Chrome className="h-4 w-4" />
            <span>Continuar com Google</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Formulário de email/senha */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "register" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={registerMutation.isPending || loginMutation.isPending}
            >
              {authMode === "register" ? "Criar Conta" : "Entrar"}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}
            >
              {authMode === "register" 
                ? "Já tem conta? Faça login" 
                : "Não tem conta? Registre-se"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUserTypeSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Escolha seu tipo de perfil</h1>
          <p className="text-lg text-muted-foreground">
            Selecione como você quer usar o UbatubaIA
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${type.bgColor} hover:scale-105`}
                onClick={() => handleTypeSelect(type.id)}
              >
                <CardHeader className="text-center">
                  <Icon className={`h-12 w-12 mx-auto mb-4 ${type.color}`} />
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${type.color.replace('text-', 'bg-')} mr-2`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderDetailsForm = () => {
    const selectedTypeInfo = userTypes.find(t => t.id === selectedType);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-2xl mx-auto py-8">
          <Button
            variant="ghost"
            onClick={() => setStep("userType")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {selectedTypeInfo && <selectedTypeInfo.icon className="h-6 w-6 mr-2" />}
                Complete seu perfil de {selectedTypeInfo?.title}
              </CardTitle>
              <CardDescription>
                Preencha as informações para criar seu perfil profissional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Informações básicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações Básicas</h3>
                  
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(12) 99999-9999"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Descrição do Perfil</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Conte sobre você e sua experiência em Ubatuba..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Ex: Centro de Ubatuba, Praia Grande..."
                      required
                    />
                  </div>
                </div>

                {/* Campos específicos por tipo */}
                {selectedType === "guide" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informações do Guia</h3>
                    
                    <div>
                      <Label htmlFor="specialties">Especialidades</Label>
                      <Textarea
                        id="specialties"
                        value={formData.specialties}
                        onChange={(e) => setFormData({...formData, specialties: e.target.value})}
                        placeholder="Ex: Trilhas ecológicas, História local, Fotografia..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience">Anos de Experiência</Label>
                      <Input
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        placeholder="Ex: 5 anos"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="certifications">Certificações</Label>
                      <Textarea
                        id="certifications"
                        value={formData.certifications}
                        onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                        placeholder="Ex: Cadastur, Primeiro Socorros, Condutor Ambiental..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="pricing">Preços dos Serviços</Label>
                      <Textarea
                        id="pricing"
                        value={formData.pricing}
                        onChange={(e) => setFormData({...formData, pricing: e.target.value})}
                        placeholder="Ex: Trilha meia-dia: R$ 80, Trilha dia todo: R$ 150..."
                        required
                      />
                    </div>
                  </div>
                )}

                {selectedType === "event_producer" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informações do Produtor</h3>
                    
                    <div>
                      <Label htmlFor="company">Empresa/Organização</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        placeholder="Nome da sua empresa ou organização"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="services">Tipos de Eventos</Label>
                      <Textarea
                        id="services"
                        value={formData.services}
                        onChange={(e) => setFormData({...formData, services: e.target.value})}
                        placeholder="Ex: Shows musicais, Festivais gastronômicos, Eventos corporativos..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience">Experiência</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        placeholder="Descreva sua experiência organizando eventos..."
                        required
                      />
                    </div>
                  </div>
                )}

                {selectedType === "boat_operator" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informações do Operador</h3>
                    
                    <div>
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        placeholder="Nome da empresa de passeios"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="equipment">Embarcações e Equipamentos</Label>
                      <Textarea
                        id="equipment"
                        value={formData.equipment}
                        onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                        placeholder="Ex: Lancha 24 pés, Capacidade 8 pessoas, Equipamentos de pesca..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="services">Tipos de Passeios</Label>
                      <Textarea
                        id="services"
                        value={formData.services}
                        onChange={(e) => setFormData({...formData, services: e.target.value})}
                        placeholder="Ex: Pesca esportiva, Mergulho, Passeios às ilhas..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="certifications">Certificações e Licenças</Label>
                      <Textarea
                        id="certifications"
                        value={formData.certifications}
                        onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                        placeholder="Ex: Arrais Amador, Cadastur, Licenças ambientais..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="pricing">Preços</Label>
                      <Textarea
                        id="pricing"
                        value={formData.pricing}
                        onChange={(e) => setFormData({...formData, pricing: e.target.value})}
                        placeholder="Ex: Passeio 4h: R$ 300, Pesca esportiva: R$ 500..."
                        required
                      />
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateProfileMutation.isPending}
                >
                  Finalizar Cadastro
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (step === "auth") {
    return renderAuthForm();
  }

  if (step === "userType") {
    return renderUserTypeSelection();
  }

  if (step === "details") {
    return renderDetailsForm();
  }

  return null;
}