import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Languages, MessageCircle, Instagram, Award, Heart, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Guide {
  id: string;
  userId: string;
  name: string;
  bio: string;
  description: string;
  specialties: string[];
  experience: string;
  languages: string[];
  experienceYears: number;
  toursCompleted: number;
  rating: number;
  imageUrl: string;
  location: string;
  certifications: string[];
  whatsapp: string;
  instagram: string;
  createdAt: string;
}

export default function GuidesNew() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Acesso necessário",
        description: "Você precisa estar logado para ver os guias.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: guides = [], isLoading: guidesLoading, error } = useQuery<Guide[]>({
    queryKey: ["/api/guides"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ocean"></div>
      </div>
    );
  }

  const getSpecialtyColor = (specialty: string) => {
    const lowerSpecialty = specialty.toLowerCase();
    if (lowerSpecialty.includes('trilha') || lowerSpecialty.includes('trail')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (lowerSpecialty.includes('mergulho') || lowerSpecialty.includes('diving')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    if (lowerSpecialty.includes('história') || lowerSpecialty.includes('history')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    }
    if (lowerSpecialty.includes('fotografia') || lowerSpecialty.includes('photo')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const handleViewGuide = (guideId: string) => {
    setLocation(`/guides/${guideId}`);
  };

  const handleWhatsApp = (phone: string, guideName: string) => {
    const message = encodeURIComponent(`Olá ${guideName}! Vi seu perfil no UbatubaIA e gostaria de conversar sobre seus serviços de guia.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Guias Locais de Ubatuba
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Conecte-se com guias experientes e descubra Ubatuba através dos olhos de quem conhece cada trilha, praia e história local.
          </p>
        </div>

        {/* Loading State */}
        {guidesLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ocean"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando guias...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-400">Erro ao carregar guias. Tente novamente.</p>
            </div>
          </div>
        )}

        {/* Guides Grid */}
        {!guidesLoading && !error && (
          <>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                {guides.length} {guides.length === 1 ? 'guia encontrado' : 'guias encontrados'}
              </p>
            </div>

            {guides.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-md mx-auto">
                  <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Nenhum guia encontrado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Ainda não há guias cadastrados na plataforma.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide) => (
                  <Card key={guide.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                      {/* Guide Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="relative">
                          <img
                            src={guide.imageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face`}
                            alt={guide.name}
                            className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-gray-700"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                            <Award className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                            {guide.name}
                          </h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(guide.rating || 0)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                                {(guide.rating || 0).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="truncate">{guide.location || 'Ubatuba, SP'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        {guide.bio || guide.description || 'Guia local experiente em Ubatuba.'}
                      </p>

                      {/* Specialties */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {guide.specialties?.slice(0, 3).map((specialty, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className={`text-xs ${getSpecialtyColor(specialty)}`}
                            >
                              {specialty}
                            </Badge>
                          ))}
                          {guide.specialties?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{guide.specialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                          <div className="text-lg font-bold text-ocean dark:text-blue-400">
                            {guide.experienceYears || 0}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Anos</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                          <div className="text-lg font-bold text-ocean dark:text-blue-400">
                            {guide.toursCompleted || 0}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Tours</div>
                        </div>
                      </div>

                      {/* Languages */}
                      {guide.languages && guide.languages.length > 0 && (
                        <div className="flex items-center mb-4 text-sm text-gray-600 dark:text-gray-300">
                          <Languages className="h-4 w-4 mr-2" />
                          <span>{guide.languages.join(', ')}</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewGuide(guide.id)}
                        >
                          Ver Perfil
                        </Button>
                        
                        {guide.whatsapp && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleWhatsApp(guide.whatsapp, guide.name)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        )}
                        
                        {guide.instagram && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`https://instagram.com/${guide.instagram.replace('@', '')}`, '_blank')}
                          >
                            <Instagram className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}