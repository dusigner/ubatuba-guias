import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Ship } from "lucide-react";
import { formatPrice, formatPhone } from "@/lib/masks";
import type { BoatTour, InsertBoatTour } from "@shared/schema";

export default function AdminBoatTours() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTour, setEditingTour] = useState<BoatTour | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertBoatTour>>({
    name: "",
    description: "",
    duration: "",
    maxPeople: "",
    price: "",
    companyName: "",
    rating: "0",
    reviewCount: 0,
    includes: [],
    imageUrl: "",
    isPopular: false,
    isRomantic: false,
  });

  const { data: tours = [], isLoading } = useQuery({
    queryKey: ["/api/boat-tours"],
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; tour: Partial<InsertBoatTour> }) =>
      apiRequest(`/api/boat-tours/${data.id}`, "PUT", data.tour),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boat-tours"] });
      toast({ title: "Passeio atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingTour(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar passeio", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/boat-tours/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boat-tours"] });
      toast({ title: "Passeio removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover passeio", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: (tour: InsertBoatTour) => apiRequest("/api/boat-tours", "POST", tour),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boat-tours"] });
      toast({ title: "Passeio criado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao criar passeio", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: "",
      maxPeople: "",
      price: "",
      companyName: "",
      rating: "0",
      reviewCount: 0,
      includes: [],
      imageUrl: "",
      isPopular: false,
      isRomantic: false,
    });
  };

  const handleEdit = (tour: BoatTour) => {
    setEditingTour(tour);
    setFormData({
      name: tour.name,
      description: tour.description,
      duration: tour.duration,
      maxPeople: tour.maxPeople,
      price: tour.price,
      companyName: tour.companyName,
      rating: tour.rating,
      reviewCount: tour.reviewCount,
      includes: tour.includes || [],
      imageUrl: tour.imageUrl || "",
      isPopular: tour.isPopular,
      isRomantic: tour.isRomantic,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tourData = {
      name: formData.name!,
      description: formData.description!,
      duration: Number(formData.duration),
      maxPeople: Number(formData.maxPeople),
      price: formData.price!,
      companyName: formData.companyName!,
      rating: formData.rating!,
      reviewCount: Number(formData.reviewCount),
      includes: formData.includes!,
      imageUrl: formData.imageUrl,
      isPopular: formData.isPopular!,
      isRomantic: formData.isRomantic!,
    };

    if (editingTour) {
      updateMutation.mutate({ id: editingTour.id, tour: tourData });
    } else {
      createMutation.mutate(tourData as InsertBoatTour);
    }
  };

  const handleArrayInput = (field: 'includes', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setFormData({ ...formData, [field]: items });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando passeios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <Ship className="mr-2" />
          Gerenciar Passeios de Barco ({tours.length})
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingTour(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Passeio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTour ? "Editar Passeio" : "Novo Passeio"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Empresa</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duração (horas)</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Máx. Pessoas</label>
                  <Input
                    type="number"
                    value={formData.maxPeople}
                    onChange={(e) => setFormData({ ...formData, maxPeople: e.target.value })}
                    placeholder="15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preço (R$)</label>
                  <Input
                    value={formData.price}
                    onChange={(e) => {
                      const formatted = formatPrice(e.target.value);
                      setFormData({ ...formData, price: formatted });
                    }}
                    placeholder="280,00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Inclui (separado por vírgula)</label>
                <Textarea
                  value={formData.includes?.join(', ') || ''}
                  onChange={(e) => handleArrayInput('includes', e.target.value)}
                  placeholder="equipamentos, lanche, guia"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Avaliação</label>
                  <Input
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="4.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nº Reviews</label>
                  <Input
                    type="number"
                    value={formData.reviewCount}
                    onChange={(e) => setFormData({ ...formData, reviewCount: Number(e.target.value) })}
                    placeholder="45"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL da Imagem</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="popular"
                    checked={formData.isPopular}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPopular: !!checked })}
                  />
                  <label htmlFor="popular" className="text-sm">Passeio Popular</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="romantic"
                    checked={formData.isRomantic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRomantic: !!checked })}
                  />
                  <label htmlFor="romantic" className="text-sm">Passeio Romântico</label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending || createMutation.isPending}
                >
                  {editingTour ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tours.map((tour: BoatTour) => (
          <Card key={tour.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {tour.name}
                    {tour.isPopular && <Badge className="bg-blue-100 text-blue-800">Popular</Badge>}
                    {tour.isRomantic && <Badge className="bg-pink-100 text-pink-800">Romântico</Badge>}
                  </CardTitle>
                  <div className="text-sm text-gray-600 mt-1">
                    {tour.companyName} • {tour.duration}h • até {tour.maxPeople} pessoas • R$ {tour.price}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(tour)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => deleteMutation.mutate(tour.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-2">{tour.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {tour.includes?.map((item, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>⭐ {tour.rating} ({tour.reviewCount} avaliações)</span>
                <span>ID: {tour.id.slice(0, 8)}...</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}