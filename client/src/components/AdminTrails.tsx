import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Mountain } from "lucide-react";
import type { Trail, InsertTrail } from "@shared/schema";

export default function AdminTrails() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTrail, setEditingTrail] = useState<Trail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertTrail>>({
    name: "",
    description: "",
    difficulty: "easy",
    distance: "",
    duration: "",
    elevation: "",
    rating: "0",
    reviewCount: 0,
    imageUrl: "",
  });

  const { data: trails = [], isLoading } = useQuery({
    queryKey: ["/api/trails"],
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; trail: Partial<InsertTrail> }) =>
      apiRequest(`/api/trails/${data.id}`, "PUT", data.trail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trails"] });
      toast({ title: "Trilha atualizada com sucesso!" });
      setIsDialogOpen(false);
      setEditingTrail(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar trilha", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/trails/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trails"] });
      toast({ title: "Trilha removida com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover trilha", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: (trail: InsertTrail) => apiRequest("/api/trails", "POST", trail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trails"] });
      toast({ title: "Trilha criada com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao criar trilha", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      difficulty: "easy",
      distance: "",
      duration: "",
      elevation: "",
      rating: "0",
      reviewCount: 0,
      imageUrl: "",
    });
  };

  const handleEdit = (trail: Trail) => {
    setEditingTrail(trail);
    setFormData({
      name: trail.name,
      description: trail.description,
      difficulty: trail.difficulty,
      distance: trail.distance,
      duration: trail.duration,
      elevation: trail.elevation,
      rating: trail.rating,
      reviewCount: trail.reviewCount,
      imageUrl: trail.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trailData = {
      name: formData.name!,
      description: formData.description!,
      difficulty: formData.difficulty!,
      distance: formData.distance!,
      duration: Number(formData.duration),
      elevation: Number(formData.elevation),
      rating: formData.rating!,
      reviewCount: Number(formData.reviewCount),
      imageUrl: formData.imageUrl,
    };

    if (editingTrail) {
      updateMutation.mutate({ id: editingTrail.id, trail: trailData });
    } else {
      createMutation.mutate(trailData as InsertTrail);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "moderate": return "bg-yellow-100 text-yellow-800";
      case "difficult": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando trilhas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <Mountain className="mr-2" />
          Gerenciar Trilhas ({trails.length})
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingTrail(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Trilha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTrail ? "Editar Trilha" : "Nova Trilha"}
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
                  <label className="block text-sm font-medium mb-2">Dificuldade</label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="moderate">Moderado</SelectItem>
                      <SelectItem value="difficult">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <label className="block text-sm font-medium mb-2">Distância (km)</label>
                  <Input
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    placeholder="5.2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duração (min)</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="180"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Elevação (m)</label>
                  <Input
                    type="number"
                    value={formData.elevation}
                    onChange={(e) => setFormData({ ...formData, elevation: e.target.value })}
                    placeholder="550"
                    required
                  />
                </div>
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

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending || createMutation.isPending}
                >
                  {editingTrail ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {trails.map((trail: Trail) => (
          <Card key={trail.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {trail.name}
                    <Badge className={getDifficultyColor(trail.difficulty)}>
                      {trail.difficulty === "easy" ? "Fácil" : 
                       trail.difficulty === "moderate" ? "Moderado" : "Difícil"}
                    </Badge>
                  </CardTitle>
                  <div className="text-sm text-gray-600 mt-1">
                    {trail.distance}km • {trail.duration}min • {trail.elevation}m elevação
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(trail)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => deleteMutation.mutate(trail.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-2">{trail.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>⭐ {trail.rating} ({trail.reviewCount} avaliações)</span>
                <span>ID: {trail.id.slice(0, 8)}...</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}