import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Mountain, Clock, Route, TrendingUp, Star } from "lucide-react";
import { Trail } from "@shared/schema";

export default function AdminTrails() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: '',
    distance: '',
    duration: '',
    elevation: '',
    imageUrl: ''
  });

  const { data: trails = [], isLoading } = useQuery<Trail[]>({
    queryKey: ["/api/trails"],
    retry: false,
  });

  const createTrailMutation = useMutation({
    mutationFn: async (trailData: any) => {
      const response = await apiRequest('POST', '/api/admin/trails', {
        ...trailData,
        distance: parseFloat(trailData.distance),
        duration: parseInt(trailData.duration),
        elevation: parseInt(trailData.elevation),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trails'] });
      toast({
        title: "Trilha criada com sucesso!",
        description: "A nova trilha foi adicionada ao catálogo.",
      });
      setFormData({
        name: '',
        description: '',
        difficulty: '',
        distance: '',
        duration: '',
        elevation: '',
        imageUrl: ''
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar trilha",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTrailMutation.mutate(formData);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'fácil':
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderado':
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'difícil':
      case 'difficult':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciar Trilhas</h2>
          <p className="text-slate-600">Adicione e gerencie as trilhas de Ubatuba</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-tropical hover:bg-tropical/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Trilha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Trilha</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Trilha *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Dificuldade *</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fácil">Fácil</SelectItem>
                      <SelectItem value="moderado">Moderado</SelectItem>
                      <SelectItem value="difícil">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <Label htmlFor="distance">Distância (km) *</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => setFormData({...formData, distance: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="elevation">Elevação (metros) *</Label>
                  <Input
                    id="elevation"
                    type="number"
                    value={formData.elevation}
                    onChange={(e) => setFormData({...formData, elevation: e.target.value})}
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
                <Button type="submit" disabled={createTrailMutation.isPending}>
                  {createTrailMutation.isPending ? 'Criando...' : 'Criar Trilha'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Trails List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trails.map((trail) => (
          <Card key={trail.id} className="overflow-hidden">
            <div className="relative">
              <img 
                src={trail.imageUrl || 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'} 
                alt={trail.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge className={getDifficultyColor(trail.difficulty)}>
                  {trail.difficulty}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{trail.name}</h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{trail.description}</p>
              
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center">
                  <Route className="h-4 w-4 mr-1" />
                  {trail.distance} km
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {Math.floor(Number(trail.duration) / 60)}h {Number(trail.duration) % 60}min
                </span>
                <span className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {trail.elevation}m
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-semibold">{trail.rating || '0.0'}</span>
                  <span className="text-sm text-slate-500 ml-1">({trail.reviewCount || 0})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}