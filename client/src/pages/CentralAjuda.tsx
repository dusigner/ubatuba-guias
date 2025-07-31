import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, HelpCircle, Search, MessageCircle, Book } from "lucide-react";
import { Link } from "wouter";

export default function CentralAjuda() {
  const faqs = [
    {
      question: "Como funciona a geração de roteiros por IA?",
      answer: "Nossa inteligência artificial analisa suas preferências, tempo disponível e interesses para criar roteiros personalizados. Basta descrever o que você gosta e nossa IA fará o resto!"
    },
    {
      question: "Os roteiros são gratuitos?",
      answer: "Sim! A geração de roteiros básicos é completamente gratuita. Oferecemos também serviços premium com funcionalidades avançadas."
    },
    {
      question: "Como posso contatar um guia local?",
      answer: "Na página de guias, você pode ver os perfis dos profissionais e entrar em contato através do WhatsApp ou Instagram disponibilizados."
    },
    {
      question: "Posso modificar o roteiro gerado?",
      answer: "Sim! Todos os roteiros podem ser personalizados. Você pode salvar, editar e adaptar conforme suas necessidades."
    },
    {
      question: "Como me tornar um guia na plataforma?",
      answer: "Faça seu cadastro escolhendo o tipo 'Guia Local' e complete seu perfil com suas especialidades, experiências e certificações."
    },
    {
      question: "As informações sobre trilhas são atualizadas?",
      answer: "Sim! Mantemos nossas informações atualizadas com base no feedback dos usuários e parcerias com guias locais."
    }
  ];

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
            <HelpCircle className="inline h-12 w-12 text-tropical mr-4" />
            Central de Ajuda
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Encontre respostas para suas dúvidas sobre a plataforma UbatubaIA
          </p>
        </div>
      </section>

      {/* Central de Ajuda */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Busca */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">O que você está procurando?</h2>
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar na central de ajuda..." 
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categorias de Ajuda */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-tropical/10 rounded-full flex items-center justify-center mb-4">
                    <Book className="h-8 w-8 text-tropical" />
                  </div>
                  <CardTitle>Primeiros Passos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Aprenda a usar a plataforma e criar seu primeiro roteiro
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-ocean" />
                  </div>
                  <CardTitle>Guias e Reservas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Como encontrar e contatar guias locais
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-sunset/10 rounded-full flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-sunset" />
                  </div>
                  <CardTitle>Problemas Técnicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Soluções para problemas comuns da plataforma
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Perguntas Frequentes</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contato para Suporte */}
            <div className="mt-16">
              <Card>
                <CardHeader>
                  <CardTitle>Não encontrou o que procurava?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Nossa equipe de suporte está pronta para ajudar você com qualquer dúvida específica.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/contato">
                      <Button className="bg-tropical hover:bg-tropical/90">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Entre em Contato
                      </Button>
                    </Link>
                    <Button variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp: (12) 99999-0000
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