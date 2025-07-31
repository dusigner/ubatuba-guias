import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Shield, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function TermosUso() {
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
            <FileText className="inline h-12 w-12 text-tropical mr-4" />
            Termos de Uso
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Leia nossos termos de uso para entender como utilizar nossa plataforma
          </p>
        </div>
      </section>

      {/* Termos */}
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
                  <Shield className="h-5 w-5 mr-2 text-tropical" />
                  1. Aceitação dos Termos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Ao acessar e usar a plataforma UbatubaIA, você concorda em cumprir e estar vinculado a estes 
                  Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
                </p>
                <p className="text-muted-foreground">
                  Estes termos se aplicam a todos os usuários da plataforma, incluindo visitantes, usuários 
                  registrados, guias, empresas parceiras e qualquer pessoa que acesse nossos serviços.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Descrição dos Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  A UbatubaIA é uma plataforma digital que oferece:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Geração de roteiros turísticos personalizados por inteligência artificial</li>
                  <li>Conexão entre turistas e guias locais certificados</li>
                  <li>Informações sobre trilhas, praias, eventos e atividades em Ubatuba</li>
                  <li>Sistema de avaliações e recomendações</li>
                  <li>Ferramentas de planejamento de viagem</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Cadastro e Conta de Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">3.1 Elegibilidade</h4>
                    <p className="text-muted-foreground">
                      Você deve ter pelo menos 18 anos para criar uma conta. Usuários menores de 18 anos 
                      devem ter supervisão e autorização dos pais ou responsáveis.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">3.2 Informações Precisas</h4>
                    <p className="text-muted-foreground">
                      Você concorda em fornecer informações precisas, atuais e completas durante o processo 
                      de registro e manter essas informações atualizadas.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">3.3 Segurança da Conta</h4>
                    <p className="text-muted-foreground">
                      Você é responsável por manter a confidencialidade de sua senha e por todas as 
                      atividades que ocorrem em sua conta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Uso Aceitável</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Você concorda em usar nossa plataforma apenas para fins legais e de acordo com estes termos. 
                    É proibido:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Usar a plataforma para qualquer propósito ilegal ou não autorizado</li>
                    <li>Publicar conteúdo ofensivo, difamatório ou inadequado</li>
                    <li>Interferir no funcionamento da plataforma ou tentar acessar sistemas não autorizados</li>
                    <li>Copiar, modificar ou distribuir nosso conteúdo sem autorização</li>
                    <li>Usar informações de outros usuários para fins não relacionados aos serviços</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Conteúdo do Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Ao publicar conteúdo em nossa plataforma (avaliações, fotos, comentários), você:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Garante que possui os direitos necessários sobre o conteúdo</li>
                    <li>Concede à UbatubaIA licença para usar, exibir e distribuir o conteúdo</li>
                    <li>Aceita que o conteúdo deve ser verdadeiro e não violar direitos de terceiros</li>
                    <li>Entende que podemos remover conteúdo inadequado a nosso critério</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Limitação de Responsabilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Importante:</strong> Leia esta seção cuidadosamente, pois limita nossa responsabilidade.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    A UbatubaIA atua como intermediária entre usuários e prestadores de serviços. Não somos 
                    responsáveis por:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Qualidade, segurança ou legalidade dos serviços oferecidos por terceiros</li>
                    <li>Acidentes, lesões ou danos durante atividades turísticas</li>
                    <li>Alterações climáticas ou condições naturais que afetem as atividades</li>
                    <li>Disputas entre usuários e prestadores de serviços</li>
                    <li>Perda de dados ou interrupções no serviço</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Modificações dos Termos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Reservamos o direito de modificar estes termos a qualquer momento. Alterações significativas 
                  serão comunicadas através da plataforma ou por email. O uso continuado após as modificações 
                  constitui aceitação dos novos termos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Para dúvidas sobre estes Termos de Uso, entre em contato:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> legal@ubatubaIA.com.br</p>
                  <p><strong>Telefone:</strong> (12) 99999-0000</p>
                  <p><strong>Endereço:</strong> Rua das Palmeiras, 123 - Centro, Ubatuba/SP</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}