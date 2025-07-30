import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  MapPin, 
  Calendar, 
  Ship, 
  Compass,
  ArrowRight,
  Star,
  Users,
  Camera
} from "lucide-react";

export default function ProfileSelection() {
  const [, setLocation] = useLocation();

  const profileTypes = [
    {
      id: 'tourist',
      title: 'Turista',
      description: 'Explore Ubatuba e descubra os melhores destinos',
      features: [
        'Acesso a roteiros personalizados',
        'Favoritar praias, trilhas e eventos',
        'Avaliações e comentários',
        'Suporte da comunidade local'
      ],
      icon: User,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      badge: 'Mais Popular',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    },
    {
      id: 'guide',
      title: 'Guia Local',
      description: 'Compartilhe seu conhecimento e conecte-se com turistas',
      features: [
        'Perfil profissional completo',
        'Exibição na seção de guias',
        'Contato direto com turistas',
        'Especialidades e certificações'
      ],
      icon: MapPin,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      badge: 'Profissional',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    },
    {
      id: 'event_producer',
      title: 'Produtor de Eventos',
      description: 'Promova seus eventos e atraia mais participantes',
      features: [
        'Criação ilimitada de eventos',
        'Gestão completa de eventos',
        'Visibilidade na plataforma',
        'Analytics e relatórios'
      ],
      icon: Calendar,
      color: 'bg-gradient-to-br from-purple-500 to-violet-600',
      badge: 'Criativo',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    },
    {
      id: 'boat_tour_operator',
      title: 'Operador de Passeios',
      description: 'Ofereça experiências náuticas inesquecíveis',
      features: [
        'Múltiplos passeios de barco',
        'Agenda e reservas online',
        'Galeria de fotos',
        'Avaliações de clientes'
      ],
      icon: Ship,
      color: 'bg-gradient-to-br from-cyan-500 to-blue-600',
      badge: 'Aventura',
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300'
    }
  ];

  const handleSelectProfile = (profileType: string) => {
    setLocation(`/create-profile/${profileType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean/5 via-white to-sunset/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-ocean to-sunset rounded-lg flex items-center justify-center">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-ocean to-sunset bg-clip-text text-transparent">
              UbatubaIA
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Bem-vindo! Escolha o tipo de perfil que melhor representa você
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Qual é o seu perfil?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Selecione o tipo de perfil que melhor descreve como você quer usar a plataforma. 
              Você poderá alterar isso posteriormente.
            </p>
          </div>

          {/* Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {profileTypes.map((profile) => {
              const IconComponent = profile.icon;
              return (
                <Card 
                  key={profile.id} 
                  className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 hover:border-ocean/20 dark:hover:border-ocean/40"
                  onClick={() => handleSelectProfile(profile.id)}
                >
                  <div className={`absolute inset-0 ${profile.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl ${profile.color} flex items-center justify-center mb-3`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <Badge className={`${profile.badgeColor} border`}>
                        {profile.badge}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-xl font-bold text-foreground group-hover:text-ocean transition-colors">
                      {profile.title}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {profile.description}
                    </p>
                  </CardHeader>

                  <CardContent className="relative">
                    <ul className="space-y-2 mb-6">
                      {profile.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-ocean fill-current" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full bg-gradient-to-r from-ocean to-sunset hover:from-ocean/90 hover:to-sunset/90 text-white group"
                      onClick={() => handleSelectProfile(profile.id)}
                    >
                      Escolher este perfil
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Section */}
          <Card className="bg-gradient-to-r from-ocean/5 to-sunset/5 dark:from-ocean/10 dark:to-sunset/10 border-ocean/20 dark:border-ocean/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-ocean to-sunset rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Não sabe qual escolher?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Se você é um visitante que quer explorar Ubatuba, escolha <strong>Turista</strong>. 
                    Se você oferece serviços locais, escolha a opção correspondente ao seu negócio.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    Você poderá alterar seu tipo de perfil nas configurações a qualquer momento
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}