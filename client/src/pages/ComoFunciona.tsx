import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, MapPin, Users, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { LandingLayout } from "@/components/LandingLayout";

export default function ComoFunciona() {
  return (
    <LandingLayout>
      {/* Header */}
      <section className="bg-gradient-to-br from-tropical/20 via-ocean/10 to-sunset/10 dark:from-tropical/30 dark:via-ocean/20 dark:to-sunset/20 py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            <Brain className="inline h-12 w-12 text-tropical mr-4" />
            Como Funciona
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Descubra como nossa plataforma inteligente cria roteiros personalizados para sua experiência perfeita em Ubatuba
          </p>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-tropical/10 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-tropical" />
                </div>
                <CardTitle>1. Conte suas Preferências</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Descreva o que você gosta: aventura, relaxamento, história, gastronomia ou qualquer combinação.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-ocean" />
                </div>
                <CardTitle>2. IA Analisa e Cria</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nossa inteligência artificial analisa suas preferências e cria um roteiro personalizado em segundos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-sunset/10 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-sunset" />
                </div>
                <CardTitle>3. Explore o Roteiro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receba um roteiro detalhado com trilhas, praias, restaurantes e atividades organizadas por dia.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-tropical/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-tropical" />
                </div>
                <CardTitle>4. Conecte-se com Guias</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Encontre guias locais especializados nas suas atividades favoritas para uma experiência ainda mais rica.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Recursos Avançados</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>IA Personalizada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Nossa inteligência artificial entende suas preferências e cria roteiros únicos baseados em:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Seus interesses e hobbies</li>
                    <li>Tempo disponível para a viagem</li>
                    <li>Nível de aventura desejado</li>
                    <li>Orçamento disponível</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conhecimento Local</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Conte com informações atualizadas e especializadas sobre:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Trilhas e cachoeiras secretas</li>
                    <li>Praias menos conhecidas</li>
                    <li>Restaurantes autênticos</li>
                    <li>Eventos culturais locais</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}