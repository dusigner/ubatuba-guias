import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Handshake, Building, Users, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Parcerias() {
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
            <Handshake className="inline h-12 w-12 text-tropical mr-4" />
            Parcerias
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Conheça nossos parceiros que tornam possível oferecer as melhores experiências em Ubatuba
          </p>
        </div>
      </section>

      {/* Parcerias */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8">Nossos Parceiros</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Trabalhamos em conjunto com uma rede cuidadosamente selecionada de parceiros locais 
                para garantir que sua experiência em Ubatuba seja autêntica e inesquecível.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-tropical/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-tropical" />
                    </div>
                    <CardTitle>Guias Locais</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Parceria com mais de 50 guias especializados certificados:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Guias de trilhas e ecoturismo</li>
                    <li>Especialistas em observação de aves</li>
                    <li>Guias de turismo histórico e cultural</li>
                    <li>Instrutores de mergulho e atividades aquáticas</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-ocean/10 rounded-full flex items-center justify-center">
                      <Building className="h-6 w-6 text-ocean" />
                    </div>
                    <CardTitle>Estabelecimentos Locais</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Colaboração com empresas e estabelecimentos da região:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Restaurantes e estabelecimentos gastronômicos</li>
                    <li>Pousadas e hotéis locais</li>
                    <li>Empresas de turismo náutico</li>
                    <li>Lojas de equipamentos esportivos</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-bold">Tipos de Parceria</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-tropical/10 rounded-full flex items-center justify-center mb-4">
                      <MapPin className="h-8 w-8 text-tropical" />
                    </div>
                    <CardTitle>Parceiros de Experiência</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Guias, operadores e empresas que oferecem experiências únicas e autênticas.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mb-4">
                      <Building className="h-8 w-8 text-ocean" />
                    </div>
                    <CardTitle>Parceiros Comerciais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Restaurantes, hotéis e estabelecimentos que oferecem serviços de qualidade.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-sunset/10 rounded-full flex items-center justify-center mb-4">
                      <Handshake className="h-8 w-8 text-sunset" />
                    </div>
                    <CardTitle>Parceiros Institucionais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Organizações locais, ONGs e iniciativas de preservação ambiental.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-16">
              <Card>
                <CardHeader>
                  <CardTitle>Seja Nosso Parceiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Você é um profissional do turismo, possui um estabelecimento ou oferece serviços em Ubatuba? 
                    Junte-se à nossa rede de parceiros e amplie seu alcance!
                  </p>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Benefícios da Parceria:</h4>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Visibilidade na principal plataforma de turismo de Ubatuba</li>
                      <li>Acesso a turistas qualificados e interessados</li>
                      <li>Sistema de avaliações para construir reputação</li>
                      <li>Suporte técnico e promocional</li>
                      <li>Ferramentas de gestão de reservas e clientes</li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Button className="bg-tropical hover:bg-tropical/90">
                      Entre em Contato
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}