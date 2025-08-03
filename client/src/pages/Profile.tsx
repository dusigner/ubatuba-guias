import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Edit, Save, X, Camera } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const profileSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Queries para buscar dados reais do usuário
  const { data: userItineraries = [] } = useQuery({
    queryKey: ["/api/itineraries"],
    enabled: !!user,
  });

  const { data: userFavorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const { data: userBookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  // Buscar dados específicos do tipo de usuário
  const { data: userBoatTours = [] } = useQuery({
    queryKey: ["/api/boat-tours"],
    enabled: !!user && user.userType === "boat_tour_operator",
  });

  const { data: userEvents = [] } = useQuery({
    queryKey: ["/api/events"],
    enabled: !!user && user.userType === "event_producer",
  });

  const { data: userGuides = [] } = useQuery({
    queryKey: ["/api/guides"],
    enabled: !!user && user.userType === "guide",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest(`/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setIsEditing(false);
    setProfileImage(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getUserTypeLabel = (type: string) => {
    const types = {
      tourist: "Turista",
      guide: "Guia Local",
      event_producer: "Produtor de Eventos",
      boat_tour_operator: "Operador de Barco",
      admin: "Administrador",
    };
    return types[type as keyof typeof types] || type;
  };

  const getUserTypeColor = (type: string) => {
    const colors = {
      tourist: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      guide: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      event_producer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      boat_tour_operator: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage 
                  src={profileImage || user?.profileImageUrl || ""} 
                  alt="Profile" 
                />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl">
                {user?.firstName} {user?.lastName}
              </CardTitle>
              <div className="flex items-center justify-center gap-2">
                <Badge className={getUserTypeColor(user?.userType || "")}>
                  {getUserTypeLabel(user?.userType || "")}
                </Badge>
                {user?.isAdmin && (
                  <Badge variant="destructive">Administrador</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    disabled={!isEditing}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    disabled={!isEditing}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled={!isEditing}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                {!isEditing ? (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Array.isArray(userItineraries) ? userItineraries.length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Roteiros</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Array.isArray(userFavorites) ? userFavorites.length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Favoritos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Array.isArray(userBookings) ? userBookings.length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Reservas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Type Specific Information */}
        {user?.userType === "boat_tour_operator" && (
          <Card>
            <CardHeader>
              <CardTitle>Meus Passeios de Barco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {Array.isArray(userBoatTours) ? userBoatTours.length : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Tours Ativos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Dias no Sistema</div>
                </div>
              </div>
              <Button
                onClick={() => setLocation("/boat-tours")}
                className="w-full"
                variant="outline"
              >
                Gerenciar Passeios
              </Button>
            </CardContent>
          </Card>
        )}

        {user?.userType === "event_producer" && (
          <Card>
            <CardHeader>
              <CardTitle>Meus Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {Array.isArray(userEvents) ? userEvents.length : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Eventos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Dias no Sistema</div>
                </div>
              </div>
              <Button
                onClick={() => setLocation("/events")}
                className="w-full"
                variant="outline"
              >
                Gerenciar Eventos
              </Button>
            </CardContent>
          </Card>
        )}

        {user?.userType === "tourist" && (
          <Card>
            <CardHeader>
              <CardTitle>Meus Roteiros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {Array.isArray(userItineraries) ? userItineraries.length : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Roteiros Criados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Dias no Sistema</div>
                </div>
              </div>
              <Button
                onClick={() => setLocation("/ai-itinerary")}
                className="w-full"
                variant="outline"
              >
                Criar Novo Roteiro
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}