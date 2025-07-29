import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Star, Waves } from "lucide-react";
import { Beach } from "@shared/schema";

export default function AdminBeaches() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    amenities: '',
    imageUrl: ''
  });

  const { data: beaches = [], isLoading } = useQuery<Beach[]>({
    queryKey: ["/api/beaches"],
    retry: false,
  });

  const createBeachMutation = useMutation({
    mutationFn: async (beachData: any) => {
      const response = await apiRequest('POST', '/api/admin/beaches', {
        ...beachData,
        amenities: beachData.amenities.split(',').map((a: string) => a.trim()).filter(Boolean),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/beaches'] });
      toast({
        title: "Praia criada com sucesso!",
        description: "A nova praia foi adicionada ao catálogo.",
      });
      setFormData({
        name: '',
        description: '',
        location: '',
        amenities: '',
        imageUrl: ''
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar praia",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBeachMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciar Praias</h2>
          <p className="text-slate-600">Adicione e gerencie as praias de Ubatuba</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-ocean hover:bg-ocean/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Praia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Praia</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Praia *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Localização *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="amenities">Comodidades (separadas por vírgula)</Label>
                <Input
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                  placeholder="Estacionamento, Chuveiro, Restaurante"
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createBeachMutation.isPending}>
                  {createBeachMutation.isPending ? 'Criando...' : 'Criar Praia'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Beaches List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beaches.map((beach) => (
          <Card key={beach.id} className="overflow-hidden">
            <div className="relative">
              <img 
                src={beach.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'} 
                alt={beach.name}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <CardContent className="p-4">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{beach.name}</h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{beach.description}</p>
              
              <div className="flex items-center text-sm text-slate-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {beach.location}
              </div>

              {beach.amenities && beach.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {beach.amenities.slice(0, 3).map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {beach.amenities.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{beach.amenities.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-semibold">{beach.rating || '0.0'}</span>
                  <span className="text-sm text-slate-500 ml-1">({beach.reviewCount || 0})</span>
                </div>
                <Waves className="h-5 w-5 text-ocean" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}