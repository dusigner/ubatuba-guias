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
import { Edit, Trash2, Plus, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/masks";
import type { Event, InsertEvent } from "@shared/schema";

export default function AdminEvents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertEvent>>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    ticketPrice: "",
    category: "",
    producerId: "local-test-user",
    producerName: "",
    imageUrl: "",
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; event: Partial<InsertEvent> }) =>
      apiRequest(`/api/events/${data.id}`, "PUT", data.event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Evento atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingEvent(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar evento", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/events/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Evento removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover evento", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: (event: InsertEvent) => apiRequest("/api/events", "POST", event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Evento criado com sucesso!" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao criar evento", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      location: "",
      ticketPrice: "",
      category: "",
      producerId: "local-test-user",
      producerName: "",
      imageUrl: "",
    });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      startDate: new Date(event.startDate).toISOString().split('T')[0],
      endDate: new Date(event.endDate).toISOString().split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      ticketPrice: event.ticketPrice,
      category: event.category,
      producerId: event.producerId,
      producerName: event.producerName,
      imageUrl: event.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      title: formData.title!,
      description: formData.description!,
      startDate: new Date(formData.startDate!),
      endDate: new Date(formData.endDate!),
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      location: formData.location!,
      ticketPrice: formData.ticketPrice!,
      category: formData.category!,
      producerId: formData.producerId!,
      producerName: formData.producerName!,
      imageUrl: formData.imageUrl,
    };

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, event: eventData });
    } else {
      createMutation.mutate(eventData as InsertEvent);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "festival": return "bg-purple-100 text-purple-800";
      case "cultura": return "bg-blue-100 text-blue-800";
      case "esporte": return "bg-green-100 text-green-800";
      case "gastronomia": return "bg-orange-100 text-orange-800";
      case "ecoturismo": return "bg-emerald-100 text-emerald-800";
      case "workshop": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando eventos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <Calendar className="mr-2" />
          Gerenciar Eventos ({events.length})
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingEvent(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Editar Evento" : "Novo Evento"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
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
                  <label className="block text-sm font-medium mb-2">Data Início</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data Fim</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Horário Início</label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Horário Fim</label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Local</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Preço Ingresso</label>
                  <Input
                    value={formData.ticketPrice}
                    onChange={(e) => {
                      const formatted = formatPrice(e.target.value);
                      setFormData({ ...formData, ticketPrice: formatted });
                    }}
                    placeholder="0,00 ou 50,00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="festival, cultura, esporte"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Organizador</label>
                  <Input
                    value={formData.producerName}
                    onChange={(e) => setFormData({ ...formData, producerName: e.target.value })}
                    placeholder="Nome do organizador"
                    required
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
                  {editingEvent ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {events.map((event: Event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {event.title}
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                  </CardTitle>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(event.startDate).toLocaleDateString('pt-BR')} às {event.startTime} - {event.location}
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.producerName} • R$ {event.ticketPrice}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => deleteMutation.mutate(event.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-2">{event.description}</p>
              <div className="text-sm text-gray-500">
                ID: {event.id.slice(0, 8)}...
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}