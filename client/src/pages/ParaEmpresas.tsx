import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building, TrendingUp, Users, Star, Target, BarChart } from "lucide-react";
import { Link } from "wouter";
import { LandingLayout } from "@/components/LandingLayout";

export default function ParaEmpresas() {
  return (
    <LandingLayout>
      {/* Header */}
      <section className="bg-gradient-to-br from-tropical/20 via-ocean/10 to-sunset/10 dark:from-tropical/30 dark:via-ocean/20 dark:to-sunset/20 py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            <Building className="inline h-12 w-12 text-tropical mr-4" />
            Para Empresas
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Potencialize seu negócio turístico em Ubatuba com nossa plataforma inteligente
          </p>
        </div>
      </section>

      {/* Para Empresas */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Benefícios */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">Por que Escolher a UbatubaIA?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-tropical/10 rounded-full flex items-center justify-center mb-4">
                      <TrendingUp className="h-8 w-8 text-tropical" />
                    </div>
                    <CardTitle>Aumente sua Receita</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Conecte-se com milhares de turistas qualificados que procuram experiências autênticas em Ubatuba.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-ocean" />
                    </div>
                    <CardTitle>Alcance Mais Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Nossa IA recomenda seus serviços para turistas com perfis compatíveis, aumentando suas chances de venda.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-sunset/10 rounded-full flex items-center justify-center mb-4">
                      <Star className="h-8 w-8 text-sunset" />
                    </div>
                    <CardTitle>Construa sua Reputação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Sistema de avaliações transparente que ajuda a construir credibilidade e atrair novos clientes.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Soluções por Tipo de Negócio */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">Soluções para Cada Tipo de Negócio</h2>
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Guias Turísticos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-tropical mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Perfil profissional com suas especialidades e certificações</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-tropical mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Sistema de agendamento integrado</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-tropical mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Recomendação automática para turistas compatíveis</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-tropical mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Gestão de avaliações e feedback</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Empresas de Turismo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-ocean mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Vitrine digital para seus passeios e serviços</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-ocean mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Integração com roteiros personalizados por IA</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-ocean mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Dashboard de controle e métricas</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-ocean mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Ferramentas de comunicação com clientes</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hotéis e Pousadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-sunset mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Presença nos roteiros recomendados</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-sunset mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Conexão direta com turistas em busca de hospedagem</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-sunset mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Sistema de avaliações e fotos</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-sunset mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Promoções e ofertas especiais</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Restaurantes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-tropical mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Inclusão automática em roteiros gastronômicos</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-tropical mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Destaque de especialidades e pratos típicos</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-tropical mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Horários de funcionamento e informações de contato</span>
                      </li>
                      <li className="flex items-start">
                        <Target className="h-5 w-5 text-tropical mr-2 mt-0.5" />
                        <span className="text-muted-foreground">Fotos do ambiente e cardápio</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Métricas e Resultados */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">Resultados Comprovados</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-tropical mb-2">50+</div>
                    <p className="text-muted-foreground">Guias Certificados</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-ocean mb-2">1000+</div>
                    <p className="text-muted-foreground">Turistas Atendidos</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-sunset mb-2">95%</div>
                    <p className="text-muted-foreground">Satisfação dos Clientes</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-tropical mb-2">24/7</div>
                    <p className="text-muted-foreground">Suporte Disponível</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Formulário de Contato Empresarial */}
            <div>
              <h2 className="text-3xl font-bold text-center mb-12">Transforme seu Negócio Hoje</h2>
              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-bold mb-6">Por que Parceiros Escolhem a UbatubaIA</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <BarChart className="h-5 w-5 text-tropical mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold">Crescimento Sustentável</h4>
                        <p className="text-muted-foreground">Aumento médio de 40% na receita dos parceiros no primeiro ano</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-ocean mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold">Clientes Qualificados</h4>
                        <p className="text-muted-foreground">Nossa IA conecta você com turistas que realmente se interessam pelos seus serviços</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Star className="h-5 w-5 text-sunset mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold">Reputação Digital</h4>
                        <p className="text-muted-foreground">Sistema transparente de avaliações que fortalece sua marca</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Solicite uma Demonstração</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nome</label>
                          <Input placeholder="Seu nome" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email</label>
                          <Input type="email" placeholder="seu@email.com" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Empresa</label>
                        <Input placeholder="Nome da sua empresa" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Tipo de Negócio</label>
                        <Input placeholder="Ex: Guia turístico, Hotel, Restaurante" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Como podemos ajudar?</label>
                        <Textarea 
                          placeholder="Conte-nos sobre seu negócio e objetivos..."
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <Button className="w-full bg-tropical hover:bg-tropical/90">
                        Solicitar Demonstração Gratuita
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}