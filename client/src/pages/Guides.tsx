import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import GuideModal from "@/components/GuideModal";
import EditGuideModal from "@/components/EditGuideModal";
import { User as UserType } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Star, MapPin, Languages, Calendar, UserPlus, MessageCircle, Instagram, Award, Tag, Heart, Edit, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Guides() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState<UserType | null>(null);
  const [, setLocation] = useLocation();

  // Note: Authentication is handled by App.tsx routing

  const { data: guides = [], isLoading: guidesLoading, error } = useQuery<any[]>({
    queryKey: ["/api/guides"],
    retry: false,
    enabled: !!user,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Erro de autorização",
      description: "Houve um problema com sua sessão. Tente recarregar a página.",
      variant: "destructive",
    });
    return null;
  }

  if (loading || !user) {
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
        return 'bg-tropical/10 text-tropical dark:bg-tropical/20 dark:text-tropical';
      case 'mergulho':
      case 'diving':
        return 'bg-ocean/10 text-ocean dark:bg-ocean/20 dark:text-ocean';
      case 'história':
      case 'history':
        return 'bg-sunset/10 text-sunset dark:bg-sunset/20 dark:text-sunset';
      case 'fotografia':
      case 'photography':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'ecoturismo':
      case 'ecotourism':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-muted text-muted-foreground';
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

  const canCreateGuide = user?.userType === 'guide' && !user?.isProfileComplete;
  const canEditGuide = user?.userType === 'guide' && user?.isProfileComplete;

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <section className="bg-gradient-to-br from-tropical/20 via-ocean/10 to-sunset/10 dark:from-tropical/30 dark:via-ocean/20 dark:to-sunset/20 py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                <Users className="inline h-12 w-12 text-tropical mr-4" />
                Guias Locais
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Conheça nossos guias especializados para uma experiência autêntica em Ubatuba
              </p>
            </div>
            <div className="flex gap-3 mt-6 lg:mt-0">
              {canCreateGuide && (
                <Button 
                  onClick={() => setShowGuideModal(true)}
                  className="bg-gradient-to-r from-tropical to-ocean text-white hover:opacity-90"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cadastrar-se como Guia
                </Button>
              )}
              {canEditGuide && (
                <Button 
                  onClick={() => {
                    const currentUserGuide = guides.find(g => g.userId === user?.id);
                    if (currentUserGuide) {
                      setEditingGuide(currentUserGuide);
                    }
                  }}
                  variant="outline"
                  className="border-ocean text-ocean hover:bg-ocean/10"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Meu Perfil
                </Button>
              )}
            </div>
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
                <Card 
                  key={guide.id} 
                  className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/guides/${guide.slug || guide.id}`)}
                >
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
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {guide.name || `${guide.firstName} ${guide.lastName}`}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {guide.bio || guide.description || 'Guia local experiente em Ubatuba'}
                    </p>
                    
                    {guide.specialties && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(Array.isArray(guide.specialties) ? guide.specialties : guide.specialties.split(',')).slice(0, 3).map((specialty: string, index: number) => (
                          <Badge key={index} className={`${getSpecialtyColor(specialty.trim())} border-0`}>
                            {getSpecialtyIcon(specialty.trim())} {specialty.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="h-4 w-4 mr-2 text-ocean" />
                        <span>{guide.location || 'Ubatuba, SP'}</span>
                      </div>
                      {guide.languages && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Languages className="h-4 w-4 mr-2 text-tropical" />
                          <span>{Array.isArray(guide.languages) ? guide.languages.join(', ') : guide.languages}</span>
                        </div>
                      )}
                      {guide.experience && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="h-4 w-4 mr-2 text-sunset" />
                          <span>{guide.experience}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">Guia Profissional</span>
                      </div>
                      <div className="flex space-x-2">
                        {guide.phone && (
                          <Button variant="ghost" size="sm" className="text-ocean hover:text-ocean/80">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {guide.instagram && (
                          <Button variant="ghost" size="sm" className="text-tropical hover:text-tropical/80">
                            <Instagram className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          className="bg-ocean text-white hover:bg-ocean/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/guides/${guide.slug || guide.id}`);
                          }}
                        >
                          Ver Perfil
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

      {/* Edit Guide Modal */}
      {editingGuide && (
        <EditGuideModal 
          isOpen={!!editingGuide}
          onClose={() => setEditingGuide(null)}
          guide={editingGuide}
        />
      )}
    </div>
  );
}
