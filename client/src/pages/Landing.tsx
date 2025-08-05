import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  MapPin, 
  Star, 
  Users, 
  Calendar, 
  TrendingUp,
  ArrowRight,
  Phone,
  Instagram
} from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  // Query para buscar apenas guias em destaque
  const { data: featuredGuides = [] } = useQuery<any[]>({
    queryKey: ["/api/guides/featured"],
  });

  const { data: beaches = [] } = useQuery<any[]>({
    queryKey: ["/api/beaches"],
  });

  const { data: trails = [] } = useQuery<any[]>({
    queryKey: ["/api/trails"],
  });

  const handleLogin = async () => {
    const { signInWithGoogle } = await import('@/lib/firebase');
    signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-tropical/20 via-ocean/10 to-sunset/10 dark:from-tropical/30 dark:via-ocean/20 dark:to-sunset/20 border-b border-border">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Descubra
              <span className="text-gradient bg-gradient-to-r from-tropical to-ocean bg-clip-text text-transparent">
                {" "}Ubatuba
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Explore as mais belas praias, trilhas e experiências de Ubatuba com nossa plataforma inteligente. 
              Roteiros personalizados com IA e guias locais especializados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleLogin} className="btn-gradient-ocean-primary text-lg px-8 py-6">
                <Sparkles className="h-5 w-5 mr-2" />
                Começar Agora - É Grátis
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <Link href="/beaches">
                  <MapPin className="h-5 w-5 mr-2" />
                  Explorar Praias
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-tropical mb-2">20+</div>
              <div className="text-muted-foreground">Praias Catalogadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-ocean mb-2">{trails.length}+</div>
              <div className="text-muted-foreground">Trilhas Mapeadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-sunset mb-2">{featuredGuides.length}</div>
              <div className="text-muted-foreground">Guias Especialistas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-forest mb-2">∞</div>
              <div className="text-muted-foreground">Roteiros Únicos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guides Section */}
      {featuredGuides.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Guias Especializados
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Conheça nossos guias locais selecionados, especialistas em mostrar o melhor de Ubatuba
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredGuides.map((guide) => (
                <Card key={guide.id} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-tropical/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={guide.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name)}&size=80&background=0ea5e9&color=fff`}
                        alt={guide.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-tropical/20"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground mb-1">
                          {guide.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{guide.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({guide.toursCompleted} tours)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {guide.location}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {guide.description}
                    </p>

                    <div className="space-y-3">
                      {guide.specialties && guide.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {guide.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          {guide.experienceYears} anos de experiência
                        </div>
                        <div className="flex gap-2">
                          {guide.whatsapp && (
                            <a 
                              href={`https://wa.me/${guide.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                          )}
                          {guide.instagram && (
                            <a 
                              href={`https://instagram.com/${guide.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-700"
                            >
                              <Instagram className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button onClick={handleLogin} className="btn-gradient-tropical-primary">
                Ver Todos os Guias
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que escolher UbatubaIA?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A plataforma mais completa para explorar Ubatuba
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <CardContent>
                <Sparkles className="h-12 w-12 text-tropical mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">IA Personalizada</h3>
                <p className="text-muted-foreground">
                  Roteiros únicos criados com inteligência artificial baseados em suas preferências
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8">
              <CardContent>
                <Users className="h-12 w-12 text-ocean mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Guias Locais</h3>
                <p className="text-muted-foreground">
                  Conecte-se com guias especializados que conhecem cada cantinho de Ubatuba
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8">
              <CardContent>
                <Calendar className="h-12 w-12 text-sunset mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Eventos Exclusivos</h3>
                <p className="text-muted-foreground">
                  Descubra eventos, festivais e experiências únicas na região
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center bg-gradient-to-br from-tropical/10 to-ocean/10 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pronto para sua aventura?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de exploradores que já descobriram Ubatuba conosco
            </p>
            <Button size="lg" onClick={handleLogin} className="btn-gradient-ocean-primary text-lg px-12 py-6">
              <Sparkles className="h-5 w-5 mr-2" />
              Começar Minha Jornada
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 UbatubaIA. Descubra o melhor de Ubatuba.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}