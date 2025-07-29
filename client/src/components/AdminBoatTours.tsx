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
import { Plus, Ship, Clock, Users, Star } from "lucide-react";
import { BoatTour } from "@shared/schema";

export default function AdminBoatTours() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    maxCapacity: '',
    imageUrl: ''
  });

  const { data: tours = [], isLoading } = useQuery<BoatTour[]>({
    queryKey: ["/api/boat-tours"],
    retry: false,
  });

  const createTourMutation = useMutation({
    mutationFn: async (tourData: any) => {
      const response = await apiRequest('POST', '/api/admin/boat-tours', {
        ...tourData,
        duration: parseInt(tourData.duration),
        price: parseFloat(tourData.price),
        maxCapacity: parseInt(tourData.maxCapacity),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boat-tours'] });
      toast({
        title: "Passeio criado com sucesso!",
        description: "O novo passeio foi adicionado ao catálogo.",
      });
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        maxCapacity: '',
        imageUrl: ''
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar passeio",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTourMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciar Passeios de Barco</h2>
          <p className="text-slate-600">Adicione e gerencie os passeios marítimos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sunset hover:bg-sunset/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Passeio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Passeio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Passeio *</Label>
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

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">Duração (horas) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    step="0.5"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxCapacity">Capacidade Máxima *</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({...formData, maxCapacity: e.target.value})}
                    required
                  />
                </div>
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
                <Button type="submit" disabled={createTourMutation.isPending}>
                  {createTourMutation.isPending ? 'Criando...' : 'Criar Passeio'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tours List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <Card key={tour.id} className="overflow-hidden">
            <div className="relative">
              <img 
                src={tour.imageUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'} 
                alt={tour.name}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <CardContent className="p-4">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{tour.name}</h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{tour.description}</p>
              
              <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {tour.duration}h
                </span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {tour.maxCapacity} pessoas
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-semibold">{tour.rating || '0.0'}</span>
                  <span className="text-sm text-slate-500 ml-1">({tour.reviewCount || 0})</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-ocean">
                    R$ {tour.price?.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}