import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MarkdownEditor from "./MarkdownEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Plus, MapPin, Waves, Upload } from "lucide-react";
import type { Beach, InsertBeach } from "@shared/schema";

export default function AdminBeaches() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingBeach, setEditingBeach] = useState<Beach | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertBeach>>({
    name: "",
    description: "",
    features: [],
    activities: [],
    rating: "0",
    reviewCount: 0,
    imageUrl: "",
    isTopRated: false,
    isPreserved: false,
    accessType: "car",
  });

  const { data: beaches = [], isLoading } = useQuery({
    queryKey: ["/api/beaches"],
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; beach: Partial<InsertBeach> }) =>
      apiRequest(`/api/beaches/${data.id}`, "PUT", data.beach),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/beaches"] });
      toast({ title: "Praia atualizada com sucesso!" });
      setIsDialogOpen(false);
      setEditingBeach(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar praia", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/beaches/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/beaches"] });
      toast({ title: "Praia removida com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover praia", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: (beach: InsertBeach) => apiRequest("/api/beaches", "POST", beach),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/beaches"] });
      toast({ title: "Praia criada com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao criar praia", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      features: [],
      activities: [],
      rating: "0",
      reviewCount: 0,
      imageUrl: "",
      isTopRated: false,
      isPreserved: false,
      accessType: "car",
    });
  };

  const handleEdit = (beach: Beach) => {
    setEditingBeach(beach);
    setFormData({
      name: beach.name,
      description: beach.description,
      features: beach.features || [],
      activities: beach.activities || [],
      rating: beach.rating,
      reviewCount: beach.reviewCount,
      imageUrl: beach.imageUrl || "",
      isTopRated: beach.isTopRated,
      isPreserved: beach.isPreserved,
      accessType: beach.accessType,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const beachData = {
      name: formData.name!,
      description: formData.description!,
      features: formData.features!,
      activities: formData.activities!,
      rating: formData.rating!,
      reviewCount: Number(formData.reviewCount),
      imageUrl: formData.imageUrl,
      isTopRated: formData.isTopRated!,
      isPreserved: formData.isPreserved!,
      accessType: formData.accessType!,
    };

    if (editingBeach) {
      updateMutation.mutate({ id: editingBeach.id, beach: beachData });
    } else {
      createMutation.mutate(beachData as InsertBeach);
    }
  };

  const handleArrayInput = (field: 'features' | 'activities', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setFormData({ ...formData, [field]: items });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando praias...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <MapPin className="mr-2" />
          Gerenciar Praias ({beaches.length})
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingBeach(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Praia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBeach ? "Editar Praia" : "Nova Praia"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição Completa</Label>
                <div className="mt-2 mb-4">
                  <MarkdownEditor
                    value={formData.description || ""}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Descreva a praia usando Markdown... 
**Negrito**, *itálico*, `código`, [links](url), ![images](url), 
## Títulos, - listas, > citações, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Características (separadas por vírgula)</label>
                  <Textarea
                    value={formData.features?.join(', ') || ''}
                    onChange={(e) => handleArrayInput('features', e.target.value)}
                    placeholder="estacionamento, restaurante, salva-vidas"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Atividades (separadas por vírgula)</label>
                  <Textarea
                    value={formData.activities?.join(', ') || ''}
                    onChange={(e) => handleArrayInput('activities', e.target.value)}
                    placeholder="surf, mergulho, contemplação"
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Acesso</label>
                  <Input
                    value={formData.accessType}
                    onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
                    placeholder="car, trail, boat"
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
                    id="topRated"
                    checked={formData.isTopRated}
                    onCheckedChange={(checked) => setFormData({ ...formData, isTopRated: !!checked })}
                  />
                  <label htmlFor="topRated" className="text-sm">Praia Top Rated</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserved"
                    checked={formData.isPreserved}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPreserved: !!checked })}
                  />
                  <label htmlFor="preserved" className="text-sm">Praia Preservada</label>
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
                  {editingBeach ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {beaches.map((beach: Beach) => (
          <Card key={beach.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {beach.name}
                    {beach.isTopRated && <Badge className="bg-yellow-100 text-yellow-800">Top Rated</Badge>}
                    {beach.isPreserved && <Badge className="bg-green-100 text-green-800">Preservada</Badge>}
                  </CardTitle>
                  <div className="text-sm text-gray-600 mt-1">
                    Acesso: {beach.accessType} • ⭐ {beach.rating} ({beach.reviewCount} reviews)
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(beach)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => deleteMutation.mutate(beach.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-2">{beach.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {beach.features?.map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {beach.activities?.map((activity, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">{activity}</Badge>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                ID: {beach.id.slice(0, 8)}...
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}