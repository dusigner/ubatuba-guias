import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useFavorites(userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: !!userId,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: (data: { itemType: string; itemId: string }) =>
      apiRequest("/api/favorites", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Favorito adicionado",
        description: "Item adicionado aos seus favoritos!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar aos favoritos",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: ({ itemType, itemId }: { itemType: string; itemId: string }) =>
      apiRequest(`/api/favorites/${itemType}/${itemId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Favorito removido",
        description: "Item removido dos seus favoritos!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover dos favoritos",
        variant: "destructive",
      });
    },
  });

  const isFavorite = (itemType: string, itemId: string) => {
    return favorites.some(
      (fav: any) => fav.itemType === itemType && fav.itemId === itemId
    );
  };

  const toggleFavorite = (itemType: string, itemId: string) => {
    if (isFavorite(itemType, itemId)) {
      removeFavoriteMutation.mutate({ itemType, itemId });
    } else {
      addFavoriteMutation.mutate({ itemType, itemId });
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    isToggling: addFavoriteMutation.isPending || removeFavoriteMutation.isPending,
  };
}