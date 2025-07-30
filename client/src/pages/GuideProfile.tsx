import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Users, Star, MapPin, Languages, Calendar, MessageCircle, 
  Instagram, Award, Phone, Mail, ArrowLeft, Heart, Share2,
  Camera, Globe, CheckCircle, MapIcon
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function GuideProfile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const guideId = params.id;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você precisa estar logado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: guide, isLoading: guideLoading, error } = useQuery<any>({
    queryKey: ["/api/guides", guideId],
    retry: false,
    enabled: isAuthenticated && !!guideId,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Não autorizado",
      description: "Você foi desconectado. Fazendo login novamente...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  if (isLoading || guideLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ocean"></div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Guia não encontrado</h1>
          <Button onClick={() => setLocation("/guides")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Guias
          </Button>
        </div>
      </div>
    );
  }

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case 'trilhas':
      case 'trails':
        return 'bg-tropical/10 text-tropical border-tropical/20';
      case 'mergulho':
      case 'diving':
        return 'bg-ocean/10 text-ocean border-ocean/20';
      case 'história':
      case 'history':
        return 'bg-sunset/10 text-sunset border-sunset/20';
      case 'fotografia':
      case 'photography':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ecoturismo':
      case 'ecotourism':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case 'trilhas':
      case 'trails':
        return '🥾';
      case 'mergulho':
      case 'diving':
        return '🤿';
      case 'história':
      case 'history':
        return '📚';
      case 'fotografia':
      case 'photography':
        return '📸';
      case 'ecoturismo':
      case 'ecotourism':
        return '🌿';
      default:
        return '⭐';
    }
  };

  const handleContact = (method: 'whatsapp' | 'instagram') => {
    if (method === 'whatsapp' && guide.whatsapp) {
      const phone = guide.whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}`, '_blank');
    } else if (method === 'instagram' && guide.instagram) {
      const username = guide.instagram.replace('@', '');
      window.open(`https://instagram.com/${username}`, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${guide.name} - Guia em Ubatuba`,
        text: `Conheça ${guide.name}, especialista em ${guide.specialties?.join(', ')} em Ubatuba`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link do perfil foi copiado para a área de transferência",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header com botão voltar */}
      <div className="container mx-auto px-4 py-4">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/guides")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Guias
        </Button>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-tropical/10 to-ocean/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Foto e Info Básica */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={guide.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name)}&size=256&background=0ea5e9&color=fff`}
                  alt={guide.name}
                  className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <Badge className="absolute bottom-2 right-2 bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              </div>
            </div>

            {/* Informações Principais */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-slate-800 mb-2">{guide.name}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-slate-600" />
                    <span className="text-slate-600">{guide.location || 'Ubatuba, SP'}</span>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(parseFloat(guide.rating) || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold">{guide.rating || '5.0'}</span>
                    <span className="text-slate-600">
                      ({guide.toursCompleted || 0} tours realizados)
                    </span>
                  </div>

                  {/* Experiência */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-tropical" />
                      <span className="text-slate-700">
                        {guide.experienceYears} anos de experiência
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    Favoritar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sobre */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Sobre {guide.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {guide.description}
                </p>
              </CardContent>
            </Card>

            {/* Especialidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Especialidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {guide.specialties?.map((specialty: string, index: number) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-3 rounded-lg border ${getSpecialtyColor(specialty)}`}
                    >
                      <span className="text-lg">{getSpecialtyIcon(specialty)}</span>
                      <span className="font-medium">{specialty}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Idiomas */}
            {guide.languages && guide.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-primary" />
                    Idiomas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.languages.map((language: string, index: number) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certificações */}
            {guide.certifications && guide.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Certificações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {guide.certifications.map((cert: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-800">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar de Contato */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Entre em Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {guide.whatsapp && (
                  <Button 
                    onClick={() => handleContact('whatsapp')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp: {guide.whatsapp}
                  </Button>
                )}
                
                {guide.instagram && (
                  <Button 
                    onClick={() => handleContact('instagram')}
                    variant="outline"
                    className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    @{guide.instagram.replace('@', '')}
                  </Button>
                )}

                <Separator />
                
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-3">
                    Interessado em um tour personalizado?
                  </p>
                  <Button className="w-full bg-gradient-to-r from-tropical to-ocean text-white">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Solicitar Orçamento
                  </Button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Dica:</strong> Mencione que encontrou {guide.name} através do UbatubaIA para um atendimento personalizado!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Tours Realizados</span>
                  <span className="font-bold text-tropical">{guide.toursCompleted || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Anos de Experiência</span>
                  <span className="font-bold text-ocean">{guide.experienceYears}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Avaliação Média</span>
                  <span className="font-bold text-yellow-600">{guide.rating || '5.0'} ⭐</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}