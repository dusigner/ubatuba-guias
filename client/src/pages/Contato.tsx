import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { LandingLayout } from "@/components/LandingLayout";

export default function Contato() {
  return (
    <LandingLayout>
      {/* Header */}
      <section className="bg-gradient-to-br from-tropical/20 via-ocean/10 to-sunset/10 dark:from-tropical/30 dark:via-ocean/20 dark:to-sunset/20 py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            <Mail className="inline h-12 w-12 text-tropical mr-4" />
            Contato
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Entre em contato conosco. Estamos aqui para ajudar com suas dúvidas e sugestões
          </p>
        </div>
      </section>

      {/* Contato */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Formulário de Contato */}
              <div>
                <h2 className="text-3xl font-bold mb-8">Envie sua Mensagem</h2>
                <Card>
                  <CardContent className="p-6">
                    <form className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nome</label>
                          <Input placeholder="Seu nome completo" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Email</label>
                          <Input type="email" placeholder="seu@email.com" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Assunto</label>
                        <Input placeholder="Sobre o que você gostaria de falar?" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Mensagem</label>
                        <Textarea 
                          placeholder="Descreva sua dúvida, sugestão ou como podemos ajudar..."
                          className="min-h-[120px]"
                        />
                      </div>
                      
                      <Button className="w-full bg-tropical hover:bg-tropical/90">
                        Enviar Mensagem
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Informações de Contato */}
              <div>
                <h2 className="text-3xl font-bold mb-8">Outras Formas de Contato</h2>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-tropical/10 rounded-full flex items-center justify-center">
                          <Mail className="h-6 w-6 text-tropical" />
                        </div>
                        <CardTitle>Email</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">
                        Para dúvidas gerais e suporte:
                      </p>
                      <p className="font-semibold">contato@ubatubaIA.com.br</p>
                      <p className="text-muted-foreground mt-2">
                        Para parcerias comerciais:
                      </p>
                      <p className="font-semibold">parcerias@ubatubaIA.com.br</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-ocean/10 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-6 w-6 text-ocean" />
                        </div>
                        <CardTitle>WhatsApp</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">
                        Atendimento rápido via WhatsApp:
                      </p>
                      <p className="font-semibold">(12) 99999-0000</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Horário: Segunda a sexta, 9h às 18h
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-sunset/10 rounded-full flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-sunset" />
                        </div>
                        <CardTitle>Endereço</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">
                        Nosso escritório em Ubatuba:
                      </p>
                      <p className="font-semibold">
                        Rua das Palmeiras, 123<br />
                        Centro - Ubatuba/SP<br />
                        CEP: 11680-000
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Horários de Atendimento</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Segunda a Sexta:</span>
                        <span className="font-semibold">9h às 18h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sábados:</span>
                        <span className="font-semibold">9h às 14h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Domingos:</span>
                        <span className="font-semibold">Fechado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}