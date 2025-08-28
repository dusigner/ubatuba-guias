import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Users, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Guide, InsertGuide } from "@shared/schema";

export default function AdminGuides() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    specialties: [],
    languages: [],
    experienceYears: 0,
    toursCompleted: 0,
    rating: "0",
    imageUrl: "",
    location: "Ubatuba, SP",
    certifications: [],
    whatsapp: "",
    instagram: "",
    featured: false,
    userId: "local-test-user",
  });

  const { data: guides = [], isLoading } = useQuery<Guide[]>({
    queryKey: ["/api/guides"],
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; guide: Partial<InsertGuide> }) =>
      apiRequest(`/api/guides/${data.id}`, "PUT", data.guide),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides"] });
      toast({ title: "Guia atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingGuide(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar guia", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/guides/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides"] });
      toast({ title: "Guia removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover guia", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: (guide: InsertGuide) => apiRequest("/api/guides", "POST", guide),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guides"] });
      toast({ title: "Guia criado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao criar guia", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      specialties: [],
      languages: [],
      experienceYears: 0,
      toursCompleted: 0,
      rating: "0",
      imageUrl: "",
      location: "Ubatuba, SP",
      certifications: [],
      whatsapp: "",
      instagram: "",
      featured: false,
      userId: "local-test-user",
    });
  };

  const handleEdit = (guide: any) => {
    setEditingGuide(guide);
    setFormData({
      name: guide.name,
      description: guide.description,
      specialties: guide.specialties || [],
      languages: guide.languages || [],
      experienceYears: guide.experienceYears,
      toursCompleted: guide.toursCompleted,
      rating: guide.rating,
      imageUrl: guide.imageUrl || "",
      location: guide.location,
      certifications: guide.certifications || [],
      whatsapp: guide.whatsapp || "",
      instagram: guide.instagram || "",
      featured: guide.featured || false,
      userId: guide.userId || "local-test-user",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const guideData = {
      name: formData.name!,
      description: formData.description!,
      specialties: formData.specialties!,
      languages: formData.languages!,
      experienceYears: Number(formData.experienceYears),
      toursCompleted: Number(formData.toursCompleted),
      rating: formData.rating!,
      imageUrl: formData.imageUrl,
      location: formData.location!,
      certifications: formData.certifications!,
      whatsapp: formData.whatsapp,
      instagram: formData.instagram,
      featured: formData.featured || false,
      userId: formData.userId!,
    };

    if (editingGuide) {
      updateMutation.mutate({ id: editingGuide.id, guide: guideData });
    } else {
      createMutation.mutate(guideData as InsertGuide);
    }
  };

  const handleArrayInput = (field: 'specialties' | 'languages' | 'certifications', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setFormData({ ...formData, [field]: items });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando guias...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <Users className="mr-2" />
          Gerenciar Guias Locais ({guides.length})
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingGuide(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Guia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingGuide ? "Editar Guia" : "Novo Guia"}
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
                  <label className="block text-sm font-medium mb-2">Anos de Experiência</label>
                  <Input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    placeholder="10"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Especialidades (separadas por vírgula)</label>
                  <Textarea
                    value={formData.specialties?.join(', ') || ''}
                    onChange={(e) => handleArrayInput('specialties', e.target.value)}
                    placeholder="trilhas, mergulho, história"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Idiomas (separados por vírgula)</label>
                  <Textarea
                    value={formData.languages?.join(', ') || ''}
                    onChange={(e) => handleArrayInput('languages', e.target.value)}
                    placeholder="português, inglês, espanhol"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Certificações (separadas por vírgula)</label>
                <Textarea
                  value={formData.certifications?.join(', ') || ''}
                  onChange={(e) => handleArrayInput('certifications', e.target.value)}
                  placeholder="Condutor Ambiental, Mergulho PADI"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tours Completos</label>
                  <Input
                    type="number"
                    value={formData.toursCompleted}
                    onChange={(e) => setFormData({ ...formData, toursCompleted: Number(e.target.value) })}
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Avaliação</label>
                  <Input
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    placeholder="4.8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Localização</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ubatuba, SP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">WhatsApp</label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="(12) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Instagram</label>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@guia_ubatuba"
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <label htmlFor="featured" className="text-sm font-medium cursor-pointer flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  Exibir na Landing Page (Guia em Destaque)
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending || createMutation.isPending}
                >
                  {editingGuide ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {guides.map((guide: Guide) => (
          <Card key={guide.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {guide.name}
                    <Badge className="bg-blue-100 text-blue-800">
                      {guide.experienceYears} anos
                    </Badge>
                    {guide.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Star className="h-3 w-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="text-sm text-gray-600 mt-1">
                    ⭐ {guide.rating} • {guide.toursCompleted} tours • {guide.location}
                  </div>
                  <div className="text-sm text-gray-500">
                    {guide.whatsapp && `📱 ${guide.whatsapp}`}
                    {guide.instagram && ` • 📷 ${guide.instagram}`}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(guide)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => deleteMutation.mutate(guide.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-2">{guide.description}</p>
              
              <div className="space-y-2 mb-3">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs font-medium text-gray-600 mr-2">Especialidades:</span>
                  {guide.specialties?.map((specialty, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{specialty}</Badge>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs font-medium text-gray-600 mr-2">Idiomas:</span>
                  {guide.languages?.map((language, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{language}</Badge>
                  ))}
                </div>

                {guide.certifications && guide.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs font-medium text-gray-600 mr-2">Certificações:</span>
                    {guide.certifications.map((cert, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-800 text-xs">{cert}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500">
                ID: {guide.id.slice(0, 8)}...
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}