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
import { Plus, User, Star, Phone, MapPin } from "lucide-react";
import { Guide } from "@shared/schema";

export default function AdminGuides() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    specialties: '',
    phone: '',
    whatsapp: '',
    languages: '',
    pricePerHour: '',
    imageUrl: ''
  });

  const { data: guides = [], isLoading } = useQuery<Guide[]>({
    queryKey: ["/api/guides"],
    retry: false,
  });

  const createGuideMutation = useMutation({
    mutationFn: async (guideData: any) => {
      const response = await apiRequest('POST', '/api/admin/guides', {
        ...guideData,
        specialties: guideData.specialties.split(',').map((s: string) => s.trim()),
        languages: guideData.languages.split(',').map((l: string) => l.trim()),
        pricePerHour: parseFloat(guideData.pricePerHour),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      toast({
        title: "Guia criado com sucesso!",
        description: "O novo guia foi adicionado ao catálogo.",
      });
      setFormData({
        name: '',
        bio: '',
        specialties: '',
        phone: '',
        whatsapp: '',
        languages: '',
        pricePerHour: '',
        imageUrl: ''
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar guia",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGuideMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciar Guias</h2>
          <p className="text-slate-600">Adicione e gerencie os guias turísticos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-tropical hover:bg-tropical/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Guia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Guia</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Guia *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Biografia *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialties">Especialidades (separadas por vírgula) *</Label>
                  <Input
                    id="specialties"
                    value={formData.specialties}
                    onChange={(e) => setFormData({...formData, specialties: e.target.value})}
                    placeholder="Trilhas, História, Fotografia"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="languages">Idiomas (separados por vírgula) *</Label>
                  <Input
                    id="languages"
                    value={formData.languages}
                    onChange={(e) => setFormData({...formData, languages: e.target.value})}
                    placeholder="Português, Inglês, Espanhol"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(12) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    placeholder="(12) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerHour">Preço/Hora (R$) *</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    step="0.01"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
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
                <Button type="submit" disabled={createGuideMutation.isPending}>
                  {createGuideMutation.isPending ? 'Criando...' : 'Criar Guia'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Guides List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <Card key={guide.id} className="overflow-hidden">
            <div className="relative">
              <img 
                src={guide.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'} 
                alt={guide.name}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <CardContent className="p-4">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{guide.name}</h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{guide.bio}</p>
              
              <div className="space-y-3">
                {guide.specialties && guide.specialties.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 mb-1">ESPECIALIDADES</h4>
                    <div className="flex flex-wrap gap-1">
                      {guide.specialties.slice(0, 3).map((specialty: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {guide.specialties.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{guide.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {guide.languages && guide.languages.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 mb-1">IDIOMAS</h4>
                    <div className="flex flex-wrap gap-1">
                      {guide.languages.map((language: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-semibold">{guide.rating || '0.0'}</span>
                  <span className="text-sm text-slate-500 ml-1">({guide.reviewCount || 0})</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-tropical">
                    R$ {guide.pricePerHour}/h
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