import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, DollarSign, Users, Star, Calendar, Phone, Instagram, ExternalLink, MessageCircle, Cloud, Sun, CloudRain } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

interface ItineraryRendererProps {
  content: string;
  title: string;
  duration: number;
}

export default function ItineraryRenderer({ content, title, duration }: ItineraryRendererProps) {
  const [, setLocation] = useLocation();

  // Função para processar e formatar o conteúdo do markdown
  const formatContent = (text: string) => {
    // Divide o conteúdo em seções
    const sections = text.split(/(?=##\s+Dia\s+\d+|##\s+Contatos|##\s+Dicas|##\s+Sugestões)/g);
    
    return sections.map((section, index) => {
      if (section.trim().startsWith('## Dia')) {
        return renderDaySection(section, index);
      } else if (section.includes('Contatos') || section.includes('Dicas') || section.includes('Sugestões')) {
        return renderInfoSection(section, index);
      }
      return null;
    }).filter(Boolean);
  };

  // Renderizar seção do clima com dados reais
  const WeatherCard = ({ date }: { date: string }) => {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchWeather = async () => {
        try {
          const response = await fetch(`/api/weather${date ? `?date=${date}` : ''}`);
          if (response.ok) {
            const data = await response.json();
            setWeather(data);
          }
        } catch (error) {
          console.error('Erro ao buscar clima:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchWeather();
    }, [date]);

    if (loading) {
      return (
        <Card className="bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 border-none mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-orange-500 animate-pulse" />
              <span className="font-medium">Carregando previsão...</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!weather) {
      return (
        <Card className="bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 border-none mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Clima de Ubatuba</span>
              </div>
              <div className="text-sm text-muted-foreground text-right">
                {date ? new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Hoje'}
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              🌤️ Consulte a previsão atual antes do passeio • Ubatuba tem clima tropical com temperatura média de 23°C
            </div>
          </CardContent>
        </Card>
      );
    }

    const getWeatherEmoji = (icon: string) => {
      const iconMap: { [key: string]: string } = {
        '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
      };
      return iconMap[icon] || '🌤️';
    };

    return (
      <Card className="bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 border-none mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getWeatherEmoji(weather.icon)}</span>
              <div>
                <div className="font-medium">
                  {weather.temperature}°C - {weather.description}
                </div>
                <div className="text-sm text-muted-foreground">
                  Umidade: {weather.humidity}% • Vento: {weather.windSpeed} km/h
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-right">
              {date ? new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Hoje'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWeatherCard = (date: string) => {
    return <WeatherCard date={date} />;
  };

  const renderDaySection = (section: string, index: number) => {
    const lines = section.split('\n').filter(line => line.trim());
    const dayTitle = lines[0]?.replace('## ', '') || `Dia ${index + 1}`;
    
    const periods = [];
    let currentPeriod = null;
    let currentContent = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('### ')) {
        if (currentPeriod) {
          periods.push({ period: currentPeriod, content: currentContent });
        }
        currentPeriod = line.replace('### ', '');
        currentContent = [];
      } else if (line.trim() && currentPeriod) {
        currentContent.push(line);
      }
    }
    
    if (currentPeriod) {
      periods.push({ period: currentPeriod, content: currentContent });
    }

    return (
      <Card key={index} className="mb-8 shadow-lg border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="bg-gradient-to-r from-ocean/10 to-tropical/10 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Calendar className="h-7 w-7 text-ocean" />
              {dayTitle}
            </CardTitle>
            <Badge variant="secondary" className="bg-ocean/10 text-ocean">
              Dia {index + 1}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {/* Card do clima */}
          {renderWeatherCard('')}
          
          <div className="space-y-8">
            {periods.map((period, pIndex) => (
              <div key={pIndex} className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-ocean to-tropical rounded-full"></div>
                <div className="pl-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-ocean to-tropical p-2 rounded-full">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-ocean">{period.period}</h4>
                  </div>
                  <div className="space-y-4 ml-2">
                    {period.content.map((item, iIndex) => {
                      return renderContentItem(item, iIndex);
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContentItem = (item: string, index: number) => {
    // Remove markdown symbols
    const cleanItem = item.replace(/^\s*-\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
    
    if (cleanItem.includes('Atividade:')) {
      return (
        <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              {cleanItem.replace('Atividade:', '').trim()}
            </span>
          </div>
        </div>
      );
    } else if (cleanItem.includes('Local:')) {
      return (
        <div key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <MapPin className="h-4 w-4" />
          <span>{cleanItem.replace('Local:', '').trim()}</span>
        </div>
      );
    } else if (cleanItem.includes('Custo') || cleanItem.includes('Preço')) {
      return (
        <div key={index} className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">{cleanItem.replace(/Custo.*?:/g, '').trim()}</span>
        </div>
      );
    } else if (cleanItem.includes('Guia sugerido:') || cleanItem.includes('Guia:')) {
      const guideInfo = cleanItem.replace(/Guia sugerido:|Guia:/g, '').trim();
      const guideName = guideInfo.split(' - ')[0] || guideInfo.split(' (')[0] || guideInfo;
      
      return (
        <Card key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-amber-800 dark:text-amber-200">
                    Guia Recomendado
                  </span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  {guideInfo}
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={() => {
                      // Buscar guia por nome (simplificado)
                      const guideSlug = guideName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                      setLocation(`/guides/${guideSlug}`);
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver Perfil
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      const message = encodeURIComponent(`Olá ${guideName}! Vi sua recomendação no roteiro do UbatubaIA e gostaria de conversar sobre seus serviços.`);
                      window.open(`https://wa.me/5512999990006?text=${message}`, '_blank');
                    }}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (cleanItem.includes('Dica:')) {
      return (
        <div key={index} className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border-l-2 border-green-400">
          <div className="flex items-start gap-2">
            <Star className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-green-700 dark:text-green-300 text-sm">
              {cleanItem.replace('Dica:', '').trim()}
            </span>
          </div>
        </div>
      );
    } else if (cleanItem.includes('Evento:') || cleanItem.includes('🎭') || cleanItem.includes('🎪')) {
      const eventInfo = cleanItem.replace(/Evento:|🎭|🎪/g, '').trim();
      const eventName = eventInfo.split(' - ')[0] || eventInfo.split(' (')[0] || eventInfo;
      
      return (
        <Card key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-purple-800 dark:text-purple-200">
                    Evento Disponível
                  </span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                  {eventInfo}
                </p>
                <Button 
                  size="sm" 
                  className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setLocation('/events')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver Eventos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (cleanItem.includes('Passeio de barco:') || cleanItem.includes('⛵') || cleanItem.includes('🚤')) {
      const tourInfo = cleanItem.replace(/Passeio de barco:|⛵|🚤/g, '').trim();
      const tourName = tourInfo.split(' - ')[0] || tourInfo.split(' (')[0] || tourInfo;
      
      return (
        <Card key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    Passeio de Barco
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  {tourInfo}
                </p>
                <Button 
                  size="sm" 
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setLocation('/boat-tours')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver Passeios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (cleanItem.trim()) {
      return (
        <div key={index} className="text-gray-700 dark:text-gray-300">
          {cleanItem}
        </div>
      );
    }
    return null;
  };

  const renderInfoSection = (section: string, index: number) => {
    const lines = section.split('\n').filter(line => line.trim());
    const sectionTitle = lines[0]?.replace('## ', '') || 'Informações';
    
    return (
      <Card key={index} className="mb-6">
        <CardHeader className="bg-secondary/5">
          <CardTitle className="flex items-center gap-2">
            {sectionTitle.includes('Contatos') ? 
              <Phone className="h-5 w-5 text-secondary-foreground" /> : 
              <Star className="h-5 w-5 text-secondary-foreground" />
            }
            {sectionTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {lines.slice(1).map((line, lIndex) => {
              const cleanLine = line.replace(/^\s*-\s*/, '').trim();
              if (!cleanLine) return null;
              
              // Se é uma seção de contatos e contém nome de guia
              if (sectionTitle.includes('Contatos') && cleanLine.includes(':')) {
                const [guideName, contact] = cleanLine.split(':').map(s => s.trim());
                return (
                  <div key={lIndex} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          {guideName}
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{contact}</span>
                          </div>
                          <a 
                            href="/guides" 
                            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                          >
                            <Users className="h-3 w-3" />
                            Ver perfil completo
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Para dicas gerais
              if (sectionTitle.includes('Dicas')) {
                return (
                  <div key={lIndex} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-400">
                    <div className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-green-700 dark:text-green-300">{cleanLine}</span>
                    </div>
                  </div>
                );
              }
              
              // Para outros tipos de informação
              return (
                <div key={lIndex} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">{cleanLine}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header do Roteiro */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-ocean/10 to-tropical/10 rounded-full mb-4">
          <Calendar className="h-8 w-8 text-ocean" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-ocean to-tropical bg-clip-text text-transparent mb-4">
          {title}
        </h1>
        <div className="flex items-center justify-center gap-3 text-muted-foreground text-lg">
          <Badge variant="outline" className="border-ocean/20 text-ocean bg-ocean/5 px-4 py-1">
            {duration} {duration === 1 ? 'dia' : 'dias'} em Ubatuba
          </Badge>
        </div>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          Roteiro personalizado criado com IA, baseado em dados reais e atualizados de Ubatuba
        </p>
      </div>

      <Separator className="mb-6" />

      {/* Conteúdo Formatado */}
      <div className="space-y-6">
        {formatContent(content)}
      </div>

      {/* Fallback para markdown não processado */}
      <div className="hidden">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}