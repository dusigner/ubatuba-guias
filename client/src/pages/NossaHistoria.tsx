import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MapPin, Users, Target } from "lucide-react";
import { Link } from "wouter";

export default function NossaHistoria() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-tropical/20 via-ocean/10 to-sunset/10 dark:from-tropical/30 dark:via-ocean/20 dark:to-sunset/20 py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Home
            </Button>
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            <Heart className="inline h-12 w-12 text-tropical mr-4" />
            Nossa História
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Conheça a jornada que nos levou a criar a primeira plataforma de turismo inteligente de Ubatuba
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8">O Início da Jornada</h2>
              <p className="text-lg text-muted-foreground mb-6">
                UbatubaIA nasceu da paixão por essa região única do litoral paulista e da visão de que a tecnologia 
                pode aproximar pessoas dos lugares mais incríveis de forma inteligente e personalizada.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Fundada em 2024, nossa missão sempre foi simples: conectar visitantes com as experiências autênticas 
                que Ubatuba tem a oferecer, desde trilhas escondidas até praias paradisíacas, criando memórias inesquecíveis.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-tropical/10 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-tropical" />
                  </div>
                  <CardTitle>Nossa Visão</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ser a principal plataforma de descoberta turística inteligente do Brasil, conectando pessoas com experiências autênticas.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-ocean" />
                  </div>
                  <CardTitle>Nossa Missão</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Democratizar o acesso às belezas de Ubatuba através da tecnologia, criando roteiros personalizados para cada viajante.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-sunset/10 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-sunset" />
                  </div>
                  <CardTitle>Nossos Valores</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Autenticidade, sustentabilidade, inovação e respeito pela cultura local e meio ambiente.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-bold">Marcos da Nossa Jornada</h2>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-tropical">2024 - O Começo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Lançamento da UbatubaIA com foco em roteiros personalizados por inteligência artificial. 
                      Início das parcerias com guias locais e estabelecimentos da região.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-ocean">2025 - Expansão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Implementação de novas funcionalidades como sistema de avaliações, 
                      integração com eventos locais e ampliação da rede de guias especializados.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-16 text-center">
              <h2 className="text-3xl font-bold mb-4">Nosso Compromisso</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Continuamos evoluindo para oferecer sempre a melhor experiência, mantendo nosso compromisso 
                com a sustentabilidade e o desenvolvimento do turismo responsável em Ubatuba.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}