import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Compass, User, Users, Calendar, Ship, CheckCircle, ArrowRight, 
  Heart, Mountain, Coffee, Camera, Trophy, Star, MapPin
} from "lucide-react";
import { useLocation } from "wouter";

type UserType = "tourist" | "guide" | "event_producer" | "boat_tour_operator";

interface UserTypeCard {
  type: UserType;
  title: string;
  description: string;
  features: string[];
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const userTypes: UserTypeCard[] = [
  {
    type: "tourist",
    title: "Turista",
    description: "Explore Ubatuba com roteiros personalizados e acesse informações completas sobre trilhas, praias e eventos",
    features: [
      "Roteiros personalizados com IA",
      "Acesso a todas as trilhas e praias",
      "Reservas de passeios e eventos",
      "Avaliações e comentários"
    ],
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200"
  },
  {
    type: "guide",
    title: "Guia Local",
    description: "Cadastre seu perfil profissional e conecte-se com turistas que buscam experiências autênticas",
    features: [
      "Perfil profissional completo",
      "Especializações e certificações",
      "Recebimento de reservas",
      "Sistema de avaliações"
    ],
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200"
  },
  {
    type: "event_producer",
    title: "Produtor de Eventos",
    description: "Divulgue seus eventos, festivais e atividades culturais para milhares de visitantes",
    features: [
      "Criação e gestão de eventos",
      "Venda de ingressos integrada",
      "Promoção para turistas",
      "Analytics e relatórios"
    ],
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200"
  },
  {
    type: "boat_tour_operator",
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

export default function Register() {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [step, setStep] = useState<"auth" | "select" | "details">("auth");
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
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
    availability: ""
  });
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/profile/complete", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Perfil criado com sucesso!",
        description: "Seu perfil foi configurado e já está disponível.",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar perfil",
        description: error.message || "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    }
  });

  const handleTypeSelect = (type: UserType) => {
    setSelectedType(type);
    if (type === "tourist") {
      // Turista não precisa de informações adicionais
      updateProfileMutation.mutate({
        userType: type,
        isProfileComplete: true
      });
    } else {
      setStep("details");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    updateProfileMutation.mutate({
      userType: selectedType,
      phone: formData.phone,
      bio: formData.bio,
      isProfileComplete: true
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Compass className="h-12 w-12 text-ocean mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Acesso Necessário</h2>
            <p className="text-slate-600 mb-4">
              Você precisa estar logado para completar seu cadastro.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-ocean text-white hover:bg-ocean/90"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <div className="container mx-auto py-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Compass className="h-10 w-10 text-ocean" />
              <span className="text-3xl font-bold text-slate-800">UbatubaIA</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Complete seu Cadastro
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Escolha como você gostaria de usar a plataforma. Você pode alterar isso posteriormente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {userTypes.map((userType) => (
              <Card 
                key={userType.type}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 ${userType.bgColor}`}
                onClick={() => handleTypeSelect(userType.type)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <userType.icon className={`h-8 w-8 ${userType.color}`} />
                  </div>
                  <CardTitle className="text-xl text-slate-800">
                    {userType.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm mb-4 text-center">
                    {userType.description}
                  </p>
                  <div className="space-y-2">
                    {userType.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className={`w-full mt-6 ${userType.color.replace('text-', 'bg-').replace('-600', '-500')} text-white hover:opacity-90`}
                    disabled={updateProfileMutation.isPending}
                  >
                    {userType.type === "tourist" ? "Começar Agora" : "Continuar"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedUserType = userTypes.find(type => type.type === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Compass className="h-8 w-8 text-ocean" />
              <span className="text-2xl font-bold text-slate-800">UbatubaIA</span>
            </div>
            <Badge className={`${selectedUserType?.color.replace('text-', 'bg-').replace('-600', '-100')} ${selectedUserType?.color} border mb-4`}>
              {selectedUserType?.title}
            </Badge>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Complete suas Informações
            </h1>
            <p className="text-slate-600">
              Adicione algumas informações para criar seu perfil profissional
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="phone">Telefone de Contato</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(12) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Sobre Você</Label>
                  <Textarea
                    id="bio"
                    placeholder={
                      selectedType === "guide" 
                        ? "Conte sobre sua experiência como guia, especialidades e o que torna seus passeios únicos..."
                        : selectedType === "event_producer"
                        ? "Descreva sua experiência na produção de eventos e os tipos de eventos que você organiza..."
                        : "Conte sobre sua empresa de passeios, tipos de embarcação e experiências oferecidas..."
                    }
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("select")}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex-1 bg-ocean text-white hover:bg-ocean/90"
                  >
                    {updateProfileMutation.isPending ? "Criando..." : "Finalizar Cadastro"}
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}