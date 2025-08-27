import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Palette, 
  Bell, 
  Globe, 
  Shield, 
  Download,
  Trash2,
  Moon,
  Sun,
  Monitor
} from "lucide-react";

interface NotificationSettings {
  itineraryReminders: boolean;
  eventUpdates: boolean;
  newContent: boolean;
  newsletter: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showActivity: boolean;
  showLocation: boolean;
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [language, setLanguage] = useState('pt-BR');
  const [notifications, setNotifications] = useState<NotificationSettings>({
    itineraryReminders: true,
    eventUpdates: true,
    newContent: false,
    newsletter: false,
  });
  
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showActivity: true,
    showLocation: false,
  });

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: "Configuração salva",
      description: "Suas preferências de notificação foram atualizadas.",
    });
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Configuração salva",
      description: "Suas configurações de privacidade foram atualizadas.",
    });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast({
      title: "Idioma alterado",
      description: "O idioma foi atualizado para " + (value === 'pt-BR' ? 'Português' : 'English'),
    });
  };

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark');
    toast({
      title: "Tema alterado",
      description: `Tema alterado para ${value === 'light' ? 'claro' : 'escuro'}`,
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seus dados serão enviados por email em breve.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Atenção",
      description: "Esta ação não pode ser desfeita. Entre em contato com o suporte.",
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Personalize sua experiência no Ubatuba Guias
          </p>
        </div>

        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a aparência da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Tema</Label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Claro
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Escuro
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Label>Idioma</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">🇧🇷 Português</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure quais notificações você deseja receber
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Lembretes de roteiro</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes sobre seus roteiros salvos
                  </p>
                </div>
                <Switch
                  checked={notifications.itineraryReminders}
                  onCheckedChange={() => handleNotificationChange('itineraryReminders')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Atualizações de eventos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações sobre novos eventos em Ubatuba
                  </p>
                </div>
                <Switch
                  checked={notifications.eventUpdates}
                  onCheckedChange={() => handleNotificationChange('eventUpdates')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Novos conteúdos</Label>
                  <p className="text-sm text-muted-foreground">
                    Avisos sobre novas trilhas, praias e passeios
                  </p>
                </div>
                <Switch
                  checked={notifications.newContent}
                  onCheckedChange={() => handleNotificationChange('newContent')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Newsletter</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba dicas e novidades por email
                  </p>
                </div>
                <Switch
                  checked={notifications.newsletter}
                  onCheckedChange={() => handleNotificationChange('newsletter')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacidade
            </CardTitle>
            <CardDescription>
              Controle quem pode ver suas informações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Visibilidade do perfil</Label>
                <Select 
                  value={privacy.profileVisibility} 
                  onValueChange={(value: 'public' | 'private' | 'friends') => 
                    handlePrivacyChange('profileVisibility', value)
                  }
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Público
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Somente amigos
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Privado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Mostrar atividade</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que outros vejam seus roteiros e avaliações
                  </p>
                </div>
                <Switch
                  checked={privacy.showActivity}
                  onCheckedChange={(checked) => handlePrivacyChange('showActivity', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Compartilhar localização</Label>
                  <p className="text-sm text-muted-foreground">
                    Usar sua localização para sugestões personalizadas
                  </p>
                </div>
                <Switch
                  checked={privacy.showLocation}
                  onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados e Conta */}
        <Card>
          <CardHeader>
            <CardTitle>Dados e Conta</CardTitle>
            <CardDescription>
              Gerencie seus dados e configurações de conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={handleExportData} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Exportar meus dados
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir conta
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>• Exportar dados: Receba um arquivo com todos os seus dados</p>
              <p>• Excluir conta: Esta ação é irreversível e remove todos os seus dados</p>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Versão */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Ubatuba Guias</p>
                <p className="text-sm text-muted-foreground">Versão 1.0.0</p>
              </div>
              <Badge variant="secondary">Beta</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}