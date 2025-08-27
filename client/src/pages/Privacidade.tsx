import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Lock, Users } from "lucide-react";
import { Link } from "wouter";
import { LandingLayout } from "@/components/LandingLayout";

export default function Privacidade() {
  return (
    <LandingLayout>
      {/* Header */}
      <section className="bg-gradient-to-br from-tropical/20 via-ocean/10 to-sunset/10 dark:from-tropical/30 dark:via-ocean/20 dark:to-sunset/20 py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            <Shield className="inline h-12 w-12 text-tropical mr-4" />
            Política de Privacidade
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Entenda como coletamos, usamos e protegemos suas informações pessoais
          </p>
        </div>
      </section>

      {/* Privacidade */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <p className="text-muted-foreground">
                Última atualização: Janeiro de 2025
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-tropical" />
                  1. Informações que Coletamos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1.1 Informações Fornecidas por Você</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Nome, email e informações de contato</li>
                      <li>Preferências de viagem e interesses</li>
                      <li>Avaliações e comentários</li>
                      <li>Fotos de perfil e conteúdo publicado</li>
                      <li>Informações de pagamento (quando aplicável)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">1.2 Informações Coletadas Automaticamente</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Endereço IP e dados de localização</li>
                      <li>Informações do dispositivo e navegador</li>
                      <li>Páginas visitadas e tempo de permanência</li>
                      <li>Cookies e tecnologias similares</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-ocean" />
                  2. Como Usamos suas Informações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Utilizamos suas informações para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Fornecer e melhorar nossos serviços</li>
                  <li>Gerar roteiros personalizados com IA</li>
                  <li>Conectar você com guias e prestadores de serviços</li>
                  <li>Enviar comunicações relevantes sobre nossos serviços</li>
                  <li>Processar pagamentos e transações</li>
                  <li>Melhorar a segurança da plataforma</li>
                  <li>Realizar análises e pesquisas para aprimoramento</li>
                  <li>Cumprir obrigações legais</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Compartilhamento de Informações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Não vendemos suas informações pessoais. Compartilhamos dados apenas em situações específicas:
                  </p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">3.1 Com Prestadores de Serviços</h4>
                    <p className="text-muted-foreground">
                      Informações necessárias são compartilhadas com guias e empresas parceiras para 
                      facilitar as reservas e prestação de serviços.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">3.2 Com Fornecedores de Tecnologia</h4>
                    <p className="text-muted-foreground">
                      Terceiros que nos ajudam a operar a plataforma, processar pagamentos e fornecer 
                      serviços de análise.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">3.3 Por Obrigação Legal</h4>
                    <p className="text-muted-foreground">
                      Quando exigido por lei, regulamentação ou processo judicial.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-sunset" />
                  4. Segurança dos Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Criptografia de dados em trânsito e em repouso</li>
                  <li>Controles de acesso rigorosos</li>
                  <li>Monitoramento contínuo de segurança</li>
                  <li>Auditorias regulares de segurança</li>
                  <li>Treinamento de equipe sobre proteção de dados</li>
                </ul>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Importante:</strong> Nenhum sistema é 100% seguro. Embora tomemos medidas rigorosas, 
                    não podemos garantir segurança absoluta.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Seus Direitos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  De acordo com a LGPD, você tem os seguintes direitos:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Acesso:</strong> Solicitar informações sobre o tratamento de seus dados</li>
                  <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                  <li><strong>Exclusão:</strong> Solicitar eliminação de dados desnecessários ou em excesso</li>
                  <li><strong>Portabilidade:</strong> Transferir dados para outro fornecedor</li>
                  <li><strong>Revogação:</strong> Retirar consentimento para tratamento</li>
                  <li><strong>Oposição:</strong> Opor-se ao tratamento em certas circunstâncias</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Cookies e Tecnologias Similares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Utilizamos cookies e tecnologias similares para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Melhorar a funcionalidade da plataforma</li>
                    <li>Personalizar sua experiência</li>
                    <li>Analisar o uso dos serviços</li>
                    <li>Fornecer recursos de segurança</li>
                  </ul>
                  <p className="text-muted-foreground">
                    Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Retenção de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mantemos suas informações pelo tempo necessário para cumprir as finalidades descritas nesta 
                  política, atender obrigações legais e resolver disputas. Dados de contas inativas por mais 
                  de 3 anos podem ser excluídos, exceto quando a retenção for exigida por lei.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Alterações nesta Política</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas 
                  através da plataforma ou por email. Recomendamos revisar esta página regularmente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Contato sobre Privacidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> privacidade@Ubatuba Guias.com.br</p>
                  <p><strong>Telefone:</strong> (12) 99999-0000</p>
                  <p><strong>Endereço:</strong> Rua das Palmeiras, 123 - Centro, Ubatuba/SP</p>
                </div>
                <div className="mt-4">
                  <Link href="/contato">
                    <Button variant="outline">
                      Entre em Contato sobre Privacidade
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}