import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus, Mountain, Image, Upload } from "lucide-react";
import MarkdownEditor from './MarkdownEditor';

import type { Trail, InsertTrail } from "@shared/schema";

export default function AdminTrails() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTrail, setEditingTrail] = useState<Trail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<InsertTrail>>({
    name: "",
    description: "",
    difficulty: "easy",
    distance: "",
    duration: 0,
    elevation: 0,
    rating: "0",
    reviewCount: 0,
    imageUrl: "",
  });

  const { data: trails = [], isLoading } = useQuery<Trail[]>({
    queryKey: ["/api/trails"],
  });

  // Garantir que o scroll seja restaurado quando o modal fechar
  useEffect(() => {
    if (!isDialogOpen) {
      // Restaurar scroll quando o modal fechar
      setTimeout(() => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }, 100);
    }
  }, [isDialogOpen]);

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
      duration: 0,
      elevation: 0,
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
      duration: parseInt(trail.duration?.toString() || "0") || 0,
      elevation: parseInt(trail.elevation?.toString() || "0") || 0,
      rating: trail.rating,
      reviewCount: trail.reviewCount || 0,
      imageUrl: trail.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploadingImage(true);
    try {
      // Para este exemplo, vou converter para base64
      // Em produção, usar serviço como Cloudinary, AWS S3, etc.
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData({ ...formData, imageUrl: result });
        setIsUploadingImage(false);
        toast({ title: "Imagem carregada com sucesso!" });
      };
      reader.onerror = () => {
        setIsUploadingImage(false);
        toast({ 
          title: "Erro ao carregar imagem", 
          description: "Tente novamente com uma imagem menor.",
          variant: "destructive" 
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploadingImage(false);
      toast({ 
        title: "Erro ao carregar imagem", 
        description: "Tente novamente com uma imagem menor.",
        variant: "destructive" 
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trailData = {
      name: formData.name!,
      description: formData.description!,
      difficulty: formData.difficulty!,
      distance: formData.distance!,
      duration: Number(formData.duration!),
      elevation: Number(formData.elevation!),
      rating: formData.rating!,
      reviewCount: formData.reviewCount!,
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

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Fácil";
      case "moderate": return "Moderado";
      case "difficult": return "Difícil";
      default: return difficulty;
    }
  };



  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando trilhas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Mountain className="h-6 w-6" />
          Gestão de Trilhas
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingTrail(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Trilha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTrail ? "Editar Trilha" : "Nova Trilha"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Trilha</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Dificuldade</Label>
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
                <Label htmlFor="description">Descrição Completa</Label>
                <div className="mt-2 mb-4">
                  <MarkdownEditor
                    value={formData.description || ""}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Descreva a trilha de forma detalhada usando Markdown... 
**Negrito**, *itálico*, `código`, [links](url), ![images](url), 
## Títulos, - listas, > citações, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="distance">Distância (km)</Label>
                  <Input
                    id="distance"
                    value={formData.distance || ""}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    placeholder="5.2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duração (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    placeholder="180"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="elevation">Elevação (m)</Label>
                  <Input
                    id="elevation"
                    type="number"
                    value={formData.elevation || ""}
                    onChange={(e) => setFormData({ ...formData, elevation: parseInt(e.target.value) || 0 })}
                    placeholder="550"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Avaliação</Label>
                  <Input
                    id="rating"
                    value={formData.rating || ""}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="4.5"
                  />
                </div>
                <div>
                  <Label htmlFor="reviewCount">Número de Reviews</Label>
                  <Input
                    id="reviewCount"
                    type="number"
                    value={formData.reviewCount || ""}
                    onChange={(e) => setFormData({ ...formData, reviewCount: parseInt(e.target.value) || 0 })}
                    placeholder="45"
                  />
                </div>
              </div>

              <div>
                <Label>Imagem de Capa</Label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploadingImage ? "Carregando..." : "Escolher Imagem"}
                    </Button>
                    <span className="text-sm text-gray-500">
                      Ou cole uma URL abaixo
                    </span>
                  </div>
                  
                  <Input
                    value={formData.imageUrl || ""}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-trail.jpg";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
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
        {trails.map((trail) => (
          <Card key={trail.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{trail.name}</h3>
                    <Badge className={getDifficultyColor(trail.difficulty)}>
                      {getDifficultyLabel(trail.difficulty)}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <div dangerouslySetInnerHTML={{ __html: trail.description }} />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📏 {trail.distance} km</span>
                    <span>⏱️ {trail.duration} min</span>
                    <span>📈 {trail.elevation} m</span>
                    <span>⭐ {trail.rating} ({trail.reviewCount} reviews)</span>
                  </div>
                </div>
                
                {trail.imageUrl && (
                  <div className="ml-4">
                    <img 
                      src={trail.imageUrl} 
                      alt={trail.name}
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-trail.jpg";
                      }}
                    />
                  </div>
                )}
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(trail)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(trail.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}