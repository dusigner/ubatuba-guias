import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Compass, Mountain, Umbrella, Ship, Calendar, Users, Sparkles, Play, Award, Leaf, Heart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Compass className="h-8 w-8 text-ocean" />
              <span className="text-2xl font-bold text-slate-800">UbatubaIA</span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#inicio" className="text-slate-600 hover:text-ocean transition-colors">Início</a>
              <a href="#roteiros" className="text-slate-600 hover:text-ocean transition-colors">Roteiros IA</a>
              <a href="#trilhas" className="text-slate-600 hover:text-ocean transition-colors">Trilhas</a>
              <a href="#praias" className="text-slate-600 hover:text-ocean transition-colors">Praias</a>
              <a href="#passeios" className="text-slate-600 hover:text-ocean transition-colors">Passeios</a>
              <a href="#eventos" className="text-slate-600 hover:text-ocean transition-colors">Eventos</a>
              <a href="#guias" className="text-slate-600 hover:text-ocean transition-colors">Guias</a>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-ocean text-white hover:bg-ocean/90"
              >
                <Users className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-ocean/80 to-tropical/80"></div>
        <div 
          className="relative bg-cover bg-center h-screen flex items-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
          }}
        >
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Descubra <span className="text-sunset">Ubatuba</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Roteiros personalizados com inteligência artificial para sua aventura perfeita no litoral norte de São Paulo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-sunset text-white hover:bg-sunset/90 text-lg px-8 py-6"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Criar Roteiro com IA
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 text-lg px-8 py-6"
              >
                <Play className="h-5 w-5 mr-2" />
                Explorar Ubatuba
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Por que escolher UbatubaIA?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              A primeira plataforma de turismo inteligente para Ubatuba, criada por especialistas locais
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-ocean/10 p-3 rounded-xl w-fit mb-4">
                  <Sparkles className="h-8 w-8 text-ocean" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">IA Personalizada</h3>
                <p className="text-slate-600">
                  Roteiros únicos gerados por inteligência artificial baseados nas suas preferências e tempo disponível.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-tropical/10 p-3 rounded-xl w-fit mb-4">
                  <Mountain className="h-8 w-8 text-tropical" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Trilhas Completas</h3>
                <p className="text-slate-600">
                  Todas as trilhas de Ubatuba com dificuldade, distância, dicas e avaliações de outros visitantes.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-sunset/10 p-3 rounded-xl w-fit mb-4">
                  <Umbrella className="h-8 w-8 text-sunset" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Praias Paradisíacas</h3>
                <p className="text-slate-600">
                  Guia completo das melhores praias com informações sobre estrutura, atividades e acesso.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-ocean/10 p-3 rounded-xl w-fit mb-4">
                  <Ship className="h-8 w-8 text-ocean" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Passeios de Lancha</h3>
                <p className="text-slate-600">
                  Reserve passeios de lancha com empresas confiáveis e explore as ilhas e enseadas de Ubatuba.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-tropical/10 p-3 rounded-xl w-fit mb-4">
                  <Calendar className="h-8 w-8 text-tropical" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Eventos Locais</h3>
                <p className="text-slate-600">
                  Descubra festivais, feiras e eventos culturais. Produtores locais podem divulgar seus eventos.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-sunset/10 p-3 rounded-xl w-fit mb-4">
                  <Users className="h-8 w-8 text-sunset" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Guias Especializados</h3>
                <p className="text-slate-600">
                  Conecte-se com guias locais certificados para experiências autênticas e seguras.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Trails */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              <Mountain className="inline h-10 w-10 text-tropical mr-4" />
              Trilhas Incríveis
            </h2>
            <p className="text-xl text-slate-600">Algumas das trilhas mais procuradas de Ubatuba</p>
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
                  <h3 className="text-xl font-bold text-slate-800">Trilha da Praia Brava</h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Moderado</span>
                </div>
                <p className="text-slate-600 mb-4">
                  Trilha moderada que leva a uma das praias mais selvagens de Ubatuba.
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
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
                  <h3 className="text-xl font-bold text-slate-800">Pico do Corcovado</h3>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">Difícil</span>
                </div>
                <p className="text-slate-600 mb-4">
                  A trilha mais desafiadora com vista panorâmica de 360° do litoral.
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
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
                  <h3 className="text-xl font-bold text-slate-800">Cachoeira do Prumirim</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Fácil</span>
                </div>
                <p className="text-slate-600 mb-4">
                  Trilha familiar que leva a uma bela cachoeira com poço natural.
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              <Umbrella className="inline h-10 w-10 text-ocean mr-4" />
              Praias Paradisíacas
            </h2>
            <p className="text-xl text-slate-600">Descubra as praias mais belas de Ubatuba</p>
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
                  <span className="bg-tropical text-white px-2 py-1 rounded text-xs">Surf</span>
                  <span className="bg-ocean text-white px-2 py-1 rounded text-xs">Mergulho</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Praia Vermelha do Norte</h3>
                <p className="text-slate-600 mb-4">
                  Uma das praias mais famosas de Ubatuba, conhecida por sua areia avermelhada única e ondas perfeitas para o surf.
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
                  <span className="bg-sunset text-white px-2 py-1 rounded text-xs">Cenário</span>
                  <span className="bg-tropical text-white px-2 py-1 rounded text-xs">Trilha</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Praia do Félix</h3>
                <p className="text-slate-600 mb-4">
                  Praia selvagem e preservada, acessível apenas por trilha. Perfeita para quem busca tranquilidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ocean to-tropical">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para sua aventura em Ubatuba?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de viajantes que já descobriram Ubatuba com nossos roteiros inteligentes
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-white text-ocean hover:bg-white/90 text-lg px-8 py-6"
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
                <span className="text-2xl font-bold">UbatubaIA</span>
              </div>
              <p className="text-slate-400 mb-4">
                Sua plataforma inteligente para descobrir o melhor de Ubatuba com roteiros personalizados por IA.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#trilhas" className="hover:text-white transition-colors">Trilhas</a></li>
                <li><a href="#praias" className="hover:text-white transition-colors">Praias</a></li>
                <li><a href="#passeios" className="hover:text-white transition-colors">Passeios</a></li>
                <li><a href="#eventos" className="hover:text-white transition-colors">Eventos</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Sobre</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nossa História</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Parcerias</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Para Empresas</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 UbatubaIA. Todos os direitos reservados. Desenvolvido com <Heart className="inline h-4 w-4 text-red-500" /> para Ubatuba.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
