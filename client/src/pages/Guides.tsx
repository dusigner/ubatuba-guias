import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import GuideModal from "@/components/GuideModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Star, MapPin, Languages, Calendar, UserPlus, MessageCircle, Instagram, Award, Tag, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Guides() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showGuideModal, setShowGuideModal] = useState(false);

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

  const { data: guides = [], isLoading: guidesLoading, error } = useQuery<any[]>({
    queryKey: ["/api/guides"],
    retry: false,
    enabled: isAuthenticated,
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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ocean"></div>
      </div>
    );
  }

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case 'trilhas':
      case 'trails':
        return 'bg-tropical/10 text-tropical';
      case 'mergulho':
      case 'diving':
        return 'bg-ocean/10 text-ocean';
      case 'história':
      case 'history':
        return 'bg-sunset/10 text-sunset';
      case 'fotografia':
      case 'photography':
        return 'bg-purple-100 text-purple-800';
      case 'ecoturismo':
      case 'ecotourism':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
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

  const canCreateGuide = user?.userType === 'guide';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      {/* Header */}
      <section className="bg-gradient-to-br from-tropical/10 to-ocean/10 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
                <Users className="inline h-12 w-12 text-tropical mr-4" />
                Guias Locais
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl">
                Conheça nossos guias especializados para uma experiência autêntica em Ubatuba
              </p>
            </div>
            {canCreateGuide && (
              <Button 
                onClick={() => setShowGuideModal(true)}
                className="bg-gradient-to-r from-tropical to-ocean text-white hover:opacity-90 mt-6 lg:mt-0"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar-se como Guia
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {guidesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : guides && guides.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((guide: any) => (
                <Card key={guide.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img 
                      src={guide.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'} 
                      alt={guide.name}
                      className="w-full h-48 object-cover"
                    />
                    
                    <div className="absolute top-4 left-4">
                      {guide.certifications && guide.certifications.length > 0 && (
                        <Badge className="bg-tropical text-white border-0">
                          <Award className="h-4 w-4 mr-1" />
                          Certificado
                        </Badge>
                      )}
                    </div>
                    
                    <div className="absolute bottom-4 right-4">
                      <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-semibold text-slate-800">{guide.rating || '0.0'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{guide.name}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {guide.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {guide.specialties?.slice(0, 3).map((specialty: string, index: number) => (
                        <Badge key={index} className={`${getSpecialtyColor(specialty)} border-0`}>
                          {getSpecialtyIcon(specialty)} {specialty}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="h-4 w-4 mr-2 text-ocean" />
                        <span>{guide.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Languages className="h-4 w-4 mr-2 text-tropical" />
                        <span>{guide.languages?.join(', ') || 'Português'}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-2 text-sunset" />
                        <span>{guide.experienceYears} anos de experiência</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">{guide.toursCompleted || 0} tours realizados</span>
                      </div>
                      <div className="flex space-x-2">
                        {guide.whatsapp && (
                          <Button variant="ghost" size="sm" className="text-ocean hover:text-ocean/80">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {guide.instagram && (
                          <Button variant="ghost" size="sm" className="text-tropical hover:text-tropical/80">
                            <Instagram className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" className="bg-ocean text-white hover:bg-ocean/90">
                          Contatar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Nenhum guia encontrado</h3>
              <p className="text-slate-600 mb-8">
                Parece que ainda não temos guias cadastrados no sistema. 
                {canCreateGuide ? ' Que tal ser o primeiro guia a se cadastrar?' : ' Nossa equipe está trabalhando para trazer os melhores guias de Ubatuba.'}
              </p>
              {canCreateGuide ? (
                <Button 
                  onClick={() => setShowGuideModal(true)}
                  className="bg-gradient-to-r from-tropical to-ocean text-white hover:opacity-90"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cadastrar-se como Guia
                </Button>
              ) : (
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-tropical text-white hover:bg-tropical/90"
                >
                  Atualizar Página
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Guide Modal */}
      <GuideModal 
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
