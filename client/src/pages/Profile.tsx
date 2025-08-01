import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Edit, Save, X, Camera } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const profileSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
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
    mutationFn: (data: ProfileFormData & { profileImageUrl?: string }) =>
      apiRequest("/api/auth/user", "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      setIsEditing(false);
      setProfileImage(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    const updateData = {
      ...data,
      ...(profileImage && { profileImageUrl: profileImage }),
    };
    updateProfileMutation.mutate(updateData);
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

  if (isLoading) {
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
      admin: "Administrador",
    };
    return types[type as keyof typeof types] || type;
  };

  const getUserTypeColor = (type: string) => {
    const colors = {
      tourist: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      guide: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      event_producer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
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
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Avatar e Info Principal */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImage || user?.profileImageUrl} />
                  <AvatarFallback className="text-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isEditing}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              <div className="text-center sm:text-left space-y-2">
                <h2 className="text-2xl font-semibold">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <Badge className={getUserTypeColor(user?.userType || "tourist")}>
                  {getUserTypeLabel(user?.userType || "tourist")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Edição */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit(onSubmit)}
                  disabled={updateProfileMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    error={errors.firstName?.message}
                  />
                ) : (
                  <div className="px-3 py-2 bg-muted rounded-md">
                    {user?.firstName}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    error={errors.lastName?.message}
                  />
                ) : (
                  <div className="px-3 py-2 bg-muted rounded-md">
                    {user?.lastName}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                />
              ) : (
                <div className="px-3 py-2 bg-muted rounded-md">
                  {user?.email}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade</CardTitle>
            <CardDescription>
              Seu histórico na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Roteiros criados pelo usuário */}
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">{userItineraries.length}</div>
                <div className="text-sm text-muted-foreground">Roteiros Criados</div>
              </div>
              
              {/* Favoritos do usuário */}
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">{userFavorites.length}</div>
                <div className="text-sm text-muted-foreground">Favoritos</div>
              </div>
              
              {/* Reservas/Bookings do usuário */}
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">{userBookings.length}</div>
                <div className="text-sm text-muted-foreground">Reservas</div>
              </div>
              
              {/* Atividades específicas por tipo de usuário */}
              <div className="text-center space-y-2">
                {user?.userType === "boat_tour_operator" && (
                  <>
                    <div className="text-2xl font-bold text-primary">
                      {userBoatTours.filter((tour: any) => tour.operatorId === user.id).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Passeios Cadastrados</div>
                  </>
                )}
                {user?.userType === "event_producer" && (
                  <>
                    <div className="text-2xl font-bold text-primary">
                      {userEvents.filter((event: any) => event.producerId === user.id).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Eventos Criados</div>
                  </>
                )}
                {user?.userType === "guide" && (
                  <>
                    <div className="text-2xl font-bold text-primary">
                      {userGuides.filter((guide: any) => guide.userId === user.id).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Perfis de Guia</div>
                  </>
                )}
                {user?.userType === "tourist" && (
                  <>
                    <div className="text-2xl font-bold text-primary">
                      {new Date(user.createdAt).getFullYear() === new Date().getFullYear() ? "Novo" : "Veterano"}
                    </div>
                    <div className="text-sm text-muted-foreground">Status</div>
                  </>
                )}
              </div>
            </div>
            
            {/* Informações adicionais baseadas no tipo de usuário */}
            {user?.userType === "boat_tour_operator" && userBoatTours.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Seus Passeios Mais Populares</h4>
                <div className="space-y-2">
                  {userBoatTours
                    .filter((tour: any) => tour.operatorId === user.id)
                    .sort((a: any, b: any) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"))
                    .slice(0, 2)
                    .map((tour: any) => (
                    <div key={tour.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm font-medium">{tour.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">★ {tour.rating || "0.0"}</span>
                        <span className="text-xs text-primary">R$ {tour.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {user?.userType === "event_producer" && userEvents.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Seus Próximos Eventos</h4>
                <div className="space-y-2">
                  {userEvents
                    .filter((event: any) => event.producerId === user.id)
                    .filter((event: any) => new Date(event.startDate) >= new Date())
                    .slice(0, 2)
                    .map((event: any) => (
                    <div key={event.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm font-medium">{event.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {userItineraries.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Seus Últimos Roteiros</h4>
                <div className="space-y-2">
                  {userItineraries
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3)
                    .map((itinerary: any) => (
                    <div key={itinerary.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm font-medium">{itinerary.title || "Roteiro para Ubatuba"}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(itinerary.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}