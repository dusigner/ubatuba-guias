import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Compass,
  Mountain,
  Umbrella,
  Ship,
  Calendar,
  Users,
  Sparkles,
  Play,
  Award,
  Leaf,
  Heart,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Waves,
  Sun,
  Navigation,
  Bot,
  Smartphone,
  Globe,
  TrendingUp,
  Camera,
  Coffee,
  Home,
} from "lucide-react";
import FirebaseLoginButton from "@/components/FirebaseLoginButton";

export default function Landing() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Ubatuba com Inteligência";

  // Buscar dados reais para exibir na landing
  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
    enabled: false, // Só quando logado
  });

  const { data: guides = [] } = useQuery({
    queryKey: ["/api/guides"],
    enabled: false, // Só quando logado
  });

  const { data: boatTours = [] } = useQuery({
    queryKey: ["/api/boat-tours"],
    enabled: false, // Só quando logado
  });

  // Efeito de digitação
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Navegação suave
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Compass className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                Ubatuba Guias
              </span>
            </div>

            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => scrollToSection("inicio")}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" />
                Início
              </button>
              <button
                onClick={() => scrollToSection("trilhas")}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mountain className="h-4 w-4" />
                Trilhas
              </button>
              <button
                onClick={() => scrollToSection("praias")}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Umbrella className="h-4 w-4" />
                Praias
              </button>
              <button
                onClick={() => scrollToSection("passeios")}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Ship className="h-4 w-4" />
                Passeios
              </button>
              <button
                onClick={() => scrollToSection("guias")}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Users className="h-4 w-4" />
                Guias
              </button>
              <button
                onClick={() => scrollToSection("eventos")}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Eventos
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <FirebaseLoginButton
                variant="default"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Users className="h-4 w-4 mr-2" />
                Entrar
              </FirebaseLoginButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 dark:from-primary/60 dark:to-primary/40"></div>
        <div
          className="relative bg-cover bg-center h-screen flex items-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')",
          }}
        >
          <div className="container mx-auto px-4 text-center text-white">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Bot className="h-4 w-4 mr-2 text-orange-400" />
              <span className="text-sm font-medium">
                Primeira IA especializada em Ubatuba
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Explore <span className="text-orange-400">{typedText}</span>
              <span className="animate-pulse text-orange-400">|</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90 leading-relaxed">
              A primeira plataforma inteligente que conecta você aos melhores
              roteiros, guias locais e experiências autênticas de Ubatuba
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8 text-sm">
              <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Navigation className="h-4 w-4 text-orange-400" />
                <span>Roteiros Personalizados</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Users className="h-4 w-4 text-orange-400" />
                <span>Guias Verificados</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Smartphone className="h-4 w-4 text-orange-400" />
                <span>100% Digital</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <FirebaseLoginButton
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 text-lg px-8 py-6 shadow-2xl"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Criar Roteiro com IA
              </FirebaseLoginButton>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("trilhas")}
                className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 text-lg px-8 py-6"
              >
                <Play className="h-5 w-5 mr-2" />
                Explorar Trilhas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Por que escolher Ubatuba Guias?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A primeira plataforma de turismo inteligente para Ubatuba, criada
              por especialistas locais
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-ocean/10 dark:bg-ocean/20 p-3 rounded-xl w-fit mb-4">
                  <Sparkles className="h-8 w-8 text-ocean" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  IA Personalizada
                </h3>
                <p className="text-muted-foreground">
                  Roteiros únicos gerados por inteligência artificial baseados
                  nas suas preferências e tempo disponível.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-tropical/10 dark:bg-tropical/20 p-3 rounded-xl w-fit mb-4">
                  <Mountain className="h-8 w-8 text-tropical" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Trilhas Completas
                </h3>
                <p className="text-muted-foreground">
                  Todas as trilhas de Ubatuba com dificuldade, distância, dicas
                  e avaliações de outros visitantes.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-sunset/10 dark:bg-sunset/20 p-3 rounded-xl w-fit mb-4">
                  <Umbrella className="h-8 w-8 text-sunset" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Praias Paradisíacas
                </h3>
                <p className="text-muted-foreground">
                  Guia completo das melhores praias com informações sobre
                  estrutura, atividades e acesso.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-ocean/10 dark:bg-ocean/20 p-3 rounded-xl w-fit mb-4">
                  <Ship className="h-8 w-8 text-ocean" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Passeios de Lancha
                </h3>
                <p className="text-muted-foreground">
                  Reserve passeios de lancha com empresas confiáveis e explore
                  as ilhas e enseadas de Ubatuba.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-tropical/10 dark:bg-tropical/20 p-3 rounded-xl w-fit mb-4">
                  <Calendar className="h-8 w-8 text-tropical" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Eventos Locais
                </h3>
                <p className="text-muted-foreground">
                  Descubra festivais, feiras e eventos culturais. Produtores
                  locais podem divulgar seus eventos.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-sunset/10 dark:bg-sunset/20 p-3 rounded-xl w-fit mb-4">
                  <Users className="h-8 w-8 text-sunset" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Guias Especializados
                </h3>
                <p className="text-muted-foreground">
                  Conecte-se com guias locais certificados para experiências
                  autênticas e seguras.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Trails */}
      <section id="trilhas" className="py-20 bg-muted/30 dark:bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              <Mountain className="inline h-10 w-10 text-tropical mr-4" />
              Trilhas Incríveis
            </h2>
            <p className="text-xl text-muted-foreground">
              Algumas das trilhas mais procuradas de Ubatuba
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
                alt="Trilha da Praia Brava"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-foreground">
                    Trilha da Praia Brava
                  </h3>
                  <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 text-xs px-2 py-1 rounded-full font-medium">
                    Moderado
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Trilha moderada que leva a uma das praias mais selvagens de
                  Ubatuba.
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>2.5 km</span>
                  <span>1h 30min</span>
                  <span>150m ↗</span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
                alt="Pico do Corcovado"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-foreground">
                    Pico do Corcovado
                  </h3>
                  <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 text-xs px-2 py-1 rounded-full font-medium">
                    Difícil
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  A trilha mais desafiadora com vista panorâmica de 360° do
                  litoral.
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>4.2 km</span>
                  <span>3h</span>
                  <span>380m ↗</span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
                alt="Cachoeira do Prumirim"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-foreground">
                    Cachoeira do Prumirim
                  </h3>
                  <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">
                    Fácil
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Trilha familiar que leva a uma bela cachoeira com poço
                  natural.
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>1.8 km</span>
                  <span>45min</span>
                  <span>80m ↗</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Beaches */}
      <section id="praias" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              <Umbrella className="inline h-10 w-10 text-ocean mr-4" />
              Praias Paradisíacas
            </h2>
            <p className="text-xl text-muted-foreground">
              Descubra as praias mais belas de Ubatuba
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl mb-6">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600"
                  alt="Praia Vermelha do Norte"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-sm font-semibold">
                    <Award className="inline h-4 w-4 text-sunset mr-1" />
                    Top Rated
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <span className="bg-tropical text-white px-2 py-1 rounded text-xs">
                    Surf
                  </span>
                  <span className="bg-ocean text-white px-2 py-1 rounded text-xs">
                    Mergulho
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Praia Vermelha do Norte
                </h3>
                <p className="text-muted-foreground mb-4">
                  Uma das praias mais famosas de Ubatuba, conhecida por sua
                  areia avermelhada única e ondas perfeitas para o surf.
                </p>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl mb-6">
                <img
                  src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600"
                  alt="Praia do Félix"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-sm font-semibold">
                    <Leaf className="inline h-4 w-4 text-tropical mr-1" />
                    Preservada
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <span className="bg-sunset text-white px-2 py-1 rounded text-xs">
                    Cenário
                  </span>
                  <span className="bg-tropical text-white px-2 py-1 rounded text-xs">
                    Trilha
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Praia do Félix
                </h3>
                <p className="text-muted-foreground mb-4">
                  Praia selvagem e preservada, acessível apenas por trilha.
                  Perfeita para quem busca tranquilidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Passeios de Barco */}
      <section
        id="passeios"
        className="py-20 bg-gradient-to-br from-ocean/10 via-blue-50/50 to-cyan-50/50 dark:from-ocean/20 dark:via-background dark:to-background"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              <Ship className="inline h-10 w-10 text-ocean mr-4" />
              Passeios de Barco
            </h2>
            <p className="text-xl text-muted-foreground">
              Explore as águas cristalinas e ilhas paradisíacas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300"
                  alt="Passeio Ilha Anchieta"
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-blue-500 text-white">
                  Mais Popular
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Ilha Anchieta
                </h3>
                <p className="text-muted-foreground mb-4">
                  Passeio completo pela Ilha Anchieta com parada para banho e
                  snorkel.
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>6 horas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Até 12 pessoas</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-ocean mb-2">R$ 180</div>
                <div className="text-sm text-muted-foreground">por pessoa</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300"
                  alt="Tour das 7 Praias"
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-green-500 text-white">
                  Aventura
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Tour das 7 Praias
                </h3>
                <p className="text-muted-foreground mb-4">
                  Conheça as 7 praias mais belas de Ubatuba em um dia
                  inesquecível.
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>8 horas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Até 15 pessoas</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-ocean mb-2">R$ 220</div>
                <div className="text-sm text-muted-foreground">por pessoa</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300"
                  alt="Pesca Esportiva"
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-orange-500 text-white">
                  Esportivo
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Pesca Esportiva
                </h3>
                <p className="text-muted-foreground mb-4">
                  Pescaria em alto mar com equipamentos profissionais inclusos.
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>4 horas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Até 8 pessoas</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-ocean mb-2">R$ 250</div>
                <div className="text-sm text-muted-foreground">por pessoa</div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              onClick={async () => {
                const { signInWithGoogle } = await import('@/lib/firebase');
                signInWithGoogle();
              }}
              className="bg-ocean text-white hover:bg-ocean/90"
            >
              Ver Todos os Passeios
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Seção de Eventos Próximos */}
      <section
        id="eventos"
        className="py-20 bg-gradient-to-br from-tropical/10 via-muted/30 to-sunset/10 dark:from-tropical/20 dark:via-muted/10 dark:to-sunset/20"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              <Calendar className="inline h-10 w-10 text-tropical mr-4" />
              Eventos em Ubatuba
            </h2>
            <p className="text-xl text-muted-foreground">
              Próximos eventos e experiências imperdíveis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="hover:shadow-xl transition-shadow border-l-4 border-l-orange-400">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                    Este fim de semana
                  </Badge>
                  <Calendar className="h-5 w-5 text-orange-500" />
                </div>
                <CardTitle className="text-foreground">
                  Festival de Inverno de Ubatuba
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Shows musicais, apresentações culturais e gastronomia local no
                  centro histórico.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Centro Histórico</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-4 w-4" />
                  <span>19h às 23h</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow border-l-4 border-l-blue-400">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    Próxima semana
                  </Badge>
                  <Waves className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle className="text-foreground">
                  Campeonato de Surf
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Competição de surf profissional na Praia Grande, com atletas
                  de todo o país.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Praia Grande</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-4 w-4" />
                  <span>08h às 17h</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow border-l-4 border-l-green-400">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    Todo mês
                  </Badge>
                  <Coffee className="h-5 w-5 text-green-500" />
                </div>
                <CardTitle className="text-foreground">
                  Feira de Produtos Locais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Feira com produtos artesanais, comidas típicas e arte local
                  caiçara.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Praça Anchieta</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="h-4 w-4" />
                  <span>Sábados 9h às 16h</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              onClick={async () => {
                const { signInWithGoogle } = await import('@/lib/firebase');
                signInWithGoogle();
              }}
              className="bg-tropical text-white hover:bg-tropical/90"
            >
              Ver Todos os Eventos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Seção de Guias Locais */}
      <section id="guias" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              <Users className="inline h-10 w-10 text-sunset mr-4" />
              Guias Especializados
            </h2>
            <p className="text-xl text-muted-foreground">
              Conheça os melhores guias locais de Ubatuba
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80"
                    alt="Carlos Silva"
                    className="w-20 h-20 rounded-full object-cover mx-auto"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <Star className="h-3 w-3 text-white fill-current" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Carlos Silva
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Especialista em Trilhas
                </p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    (4.9)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "Conheço cada trilha de Ubatuba há mais de 15 anos. Vamos
                  explorar a Mata Atlântica juntos!"
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Mountain className="h-4 w-4 text-tropical" />
                    <span>Trilhas e Ecoturismo</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Camera className="h-4 w-4 text-sunset" />
                    <span>Fotografia de Natureza</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80"
                    alt="Ana Costa"
                    className="w-20 h-20 rounded-full object-cover mx-auto"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <Waves className="h-3 w-3 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Ana Costa
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Guia Cultural Caiçara
                </p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    (5.0)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "Nascida e criada aqui, vou te mostrar a verdadeira cultura
                  caiçara de Ubatuba."
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Heart className="h-4 w-4 text-sunset" />
                    <span>Cultura Caiçara</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Coffee className="h-4 w-4 text-tropical" />
                    <span>Gastronomia Local</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80"
                    alt="Pedro Santos"
                    className="w-20 h-20 rounded-full object-cover mx-auto"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <Ship className="h-3 w-3 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Pedro Santos
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Capitão Marítimo
                </p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    (4.8)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "Conheço cada ilha e enseada de Ubatuba. Vamos explorar o mar
                  juntos com segurança!"
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Ship className="h-4 w-4 text-ocean" />
                    <span>Passeios de Barco</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Waves className="h-4 w-4 text-tropical" />
                    <span>Mergulho e Snorkel</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              onClick={() => (window.location.href = "/login-instructions")}
              className="bg-sunset text-white hover:bg-sunset/90"
            >
              Conectar com Guias
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Parallax Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
            transform: 'translateZ(0)'
          }}
        ></div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50 dark:from-black/70 dark:via-black/50 dark:to-black/70"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
            Pronto para sua aventura em Ubatuba?
          </h2>
          <p className="text-xl text-white/95 dark:text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Junte-se a milhares de viajantes que já descobriram Ubatuba com
            nossos roteiros inteligentes
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = "/login-instructions")}
            className="bg-white/95 text-ocean hover:bg-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm hover:scale-105"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Começar Agora - É Grátis!
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Compass className="h-8 w-8 text-ocean" />
                <span className="text-2xl font-bold">Ubatuba Guias</span>
              </div>
              <p className="text-slate-400 mb-4">
                Sua plataforma inteligente para descobrir o melhor de Ubatuba
                com roteiros personalizados por IA.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a
                    href="#trilhas"
                    className="hover:text-white transition-colors"
                  >
                    Trilhas
                  </a>
                </li>
                <li>
                  <a
                    href="#praias"
                    className="hover:text-white transition-colors"
                  >
                    Praias
                  </a>
                </li>
                <li>
                  <a
                    href="#passeios"
                    className="hover:text-white transition-colors"
                  >
                    Passeios
                  </a>
                </li>
                <li>
                  <a
                    href="#eventos"
                    className="hover:text-white transition-colors"
                  >
                    Eventos
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Sobre</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    href="/como-funciona"
                    className="hover:text-white transition-colors"
                  >
                    Como Funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="/nossa-historia"
                    className="hover:text-white transition-colors"
                  >
                    Nossa História
                  </Link>
                </li>
                <li>
                  <Link
                    href="/parcerias"
                    className="hover:text-white transition-colors"
                  >
                    Parcerias
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contato"
                    className="hover:text-white transition-colors"
                  >
                    Contato
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    href="/central-ajuda"
                    className="hover:text-white transition-colors"
                  >
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/termos-uso"
                    className="hover:text-white transition-colors"
                  >
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacidade"
                    className="hover:text-white transition-colors"
                  >
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/para-empresas"
                    className="hover:text-white transition-colors"
                  >
                    Para Empresas
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>
              &copy; 2025 Ubatuba Guias. Todos os direitos reservados. Desenvolvido
              com <Heart className="inline h-4 w-4 text-red-500" /> para
              Ubatuba.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
