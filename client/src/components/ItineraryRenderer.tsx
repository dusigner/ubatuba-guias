import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, DollarSign, Users, Star, Calendar, Phone, Instagram } from "lucide-react";

interface ItineraryRendererProps {
  content: string;
  title: string;
  duration: number;
}

export default function ItineraryRenderer({ content, title, duration }: ItineraryRendererProps) {
  // Função para processar e formatar o conteúdo do markdown
  const formatContent = (text: string) => {
    // Divide o conteúdo em seções
    const sections = text.split(/(?=##\s+Dia\s+\d+|##\s+Contatos|##\s+Dicas)/g);
    
    return sections.map((section, index) => {
      if (section.trim().startsWith('## Dia')) {
        return renderDaySection(section, index);
      } else if (section.includes('Contatos') || section.includes('Dicas')) {
        return renderInfoSection(section, index);
      }
      return null;
    }).filter(Boolean);
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
      <Card key={index} className="mb-6">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-6 w-6 text-primary" />
            {dayTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {periods.map((period, pIndex) => (
              <div key={pIndex} className="border-l-4 border-primary/20 pl-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-lg text-primary">{period.period}</h4>
                </div>
                <div className="space-y-2">
                  {period.content.map((item, iIndex) => {
                    return renderContentItem(item, iIndex);
                  })}
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
    } else if (cleanItem.includes('Guia sugerido:')) {
      return (
        <div key={index} className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800 dark:text-amber-200 text-sm">
              {cleanItem.replace('Guia sugerido:', '').trim()}
            </span>
          </div>
        </div>
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
    } else if (cleanItem.includes('Jantar:') || cleanItem.includes('Evento:')) {
      return (
        <div key={index} className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <span className="text-purple-800 dark:text-purple-200 font-medium">
            {cleanItem.replace(/(Jantar|Evento):/g, '').trim()}
          </span>
        </div>
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
          <div className="space-y-3">
            {lines.slice(1).map((line, lIndex) => {
              const cleanLine = line.replace(/^\s*-\s*/, '').trim();
              if (!cleanLine) return null;
              
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
    <div className="max-w-4xl mx-auto">
      {/* Header do Roteiro */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className="text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            {duration} {duration === 1 ? 'dia' : 'dias'}
          </Badge>
          <Badge variant="outline" className="text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            Ubatuba, SP
          </Badge>
        </div>
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
          className="prose prose-sm dark:prose-invert max-w-none"
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}