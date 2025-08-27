import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Clock, Ticket, Loader2 } from "lucide-react";

const eventSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de fim é obrigatória"),
  location: z.string().min(3, "Local é obrigatório"),
  startTime: z.string().min(1, "Horário de início é obrigatório"),
  endTime: z.string().min(1, "Horário de fim é obrigatório"),
  ticketPrice: z.string().min(1, "Preço do ingresso é obrigatório"),
  ticketLink: z.string().url("URL inválida").optional().or(z.literal("")),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  category: z.string().min(1, "Categoria é obrigatória"),
  producerName: z.string().min(2, "Nome do produtor é obrigatório"),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: any; // Event data for editing
  isEditing?: boolean;
}

export default function EventModal({ isOpen, onClose, event, isEditing = false }: EventModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    mode: "onChange", // Valida enquanto o usuário digita
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      startDate: event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : "",
      endDate: event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
      location: event?.location || "",
      startTime: event?.startTime || "",
      endTime: event?.endTime || "",
      ticketPrice: event?.ticketPrice || "",
      ticketLink: event?.ticketLink || "",
      imageUrl: event?.imageUrl || "",
      category: event?.category || "",
      producerName: event?.producerName || (user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user?.email || ""),
    },
  });

  // Resetar o formulário APENAS quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    } else if (isEditing) {
      // Quando o modal abre em modo de edição, preencher os valores
      form.reset({
        title: event?.title || "",
        description: event?.description || "",
        startDate: event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : "",
        endDate: event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
        location: event?.location || "",
        startTime: event?.startTime || "",
        endTime: event?.endTime || "",
        ticketPrice: event?.ticketPrice || "",
        ticketLink: event?.ticketLink || "",
        imageUrl: event?.imageUrl || "",
        category: event?.category || "",
        producerName: event?.producerName || (user?.firstName && user?.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user?.email || ""),
      });
    }
  }, [isOpen, event, user, form, isEditing]);

  const eventMutation = useMutation({
    mutationFn: async (eventData: EventFormData) => {
      const url = isEditing ? `/api/events/${event.id}` : '/api/events';
      const method = isEditing ? 'PUT' : 'POST';
      const response = await apiRequest(url, method, eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ['/api/events', event.id] });
      }
      toast({
        title: isEditing ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!",
        description: isEditing ? "As alterações foram salvas." : "Seu evento foi cadastrado e já está visível para os turistas.",
      });
      // Não reseta o form aqui para dar tempo dos erros serem exibidos (se houver)
      onClose();
    },
    onError: async (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(async () => {
          const { signInWithGoogle } = await import('@/lib/firebase');
          signInWithGoogle();
        }, 500);
        return;
      }

      form.clearErrors();

      let errorMessage = isEditing ? "Houve um problema ao salvar as alterações. Tente novamente." : "Houve um problema ao cadastrar seu evento. Tente novamente.";
      
      if (error instanceof Error) {
        try {
          const errorText = error.message.split(': ')[1]; // Assume formato "status: JSON_STRING"
          const errorJson = JSON.parse(errorText);
          
          // ZodError do backend
          if (errorJson.error === 'Dados inválidos' && errorJson.details && Array.isArray(errorJson.details)) {
            errorJson.details.forEach((err: { field: string, message: string }) => {
              // Mapear erros da API para campos do formulário
              if (err.field in form.control._fields) { // Verifica se o campo existe no form
                 form.setError(err.field as keyof EventFormData, {
                   type: "server",
                   message: err.message,
                 });
              } else {
                errorMessage = err.message;
              }
            });
            // Se houver erros específicos, não exibir o toast genérico, pois já está no campo
            if (errorJson.details.length > 0) {
              errorMessage = "Por favor, corrija os erros nos campos indicados.";
            }
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          } else {
             errorMessage = error.message;
          }
        } catch (parseError) {
          console.error("Falha ao parsear resposta de erro da API:", parseError);
          errorMessage = error.message; 
        }
      }
      
      toast({
        title: isEditing ? "Erro ao atualizar evento" : "Erro ao criar evento",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    // Validação de datas antes de enviar para a API
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (endDate < startDate) {
      form.setError("endDate", { type: "manual", message: "A data de fim deve ser posterior à data de início." });
      toast({
        title: "Datas inválidas",
        description: "A data de fim deve ser posterior à data de início.",
        variant: "destructive",
      });
      return; // Impede a submissão se houver erro de data
    }

    eventMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset(); // Reseta o formulário e os erros ao fechar
    onClose();
  };

  const categories = [
    { value: "música", label: "Música" },
    { value: "cultural", label: "Cultural" },
    { value: "comida", label: "Comida e Gastronomia" },
    { value: "esporte", label: "Esporte" },
    { value: "arte", label: "Arte" },
    { value: "negócios", label: "Negócios" },
    { value: "educação", label: "Educação" },
    { value: "família", label: "Família" },
    { value: "outro", label: "Outro" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Calendar className="h-6 w-6 text-sunset mr-2" />
            {isEditing ? "Editar Evento" : "Cadastrar Novo Evento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do seu evento" : "Divulgue seu evento para milhares de turistas em Ubatuba"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
                Informações Básicas
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Evento *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Festival de Música de Ubatuba" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva seu evento, principais atrações, público-alvo, etc."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="producerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produtor/Organizador *</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome ou nome da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-tropical" />
                Data e Horário
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Fim *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Início *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Fim *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location & Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-ocean" />
                Local e Ingressos
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local do Evento *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Praia do Tenório, Centro de Ubatuba" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ticketPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço dos Ingressos *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: R$ 50 - R$ 120, Gratuito" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ticketLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link para Compra de Ingressos</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: https://ingressos.site.com/evento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Imagem do Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: https://exemplo.com/foto-evento.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={eventMutation.isPending || form.formState.isSubmitting}
                className="bg-gradient-to-r from-sunset to-ocean text-white hover:opacity-90"
              >
                {eventMutation.isPending || form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? "Salvando..." : "Cadastrando..."}
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    {isEditing ? "Salvar Alterações" : "Cadastrar Evento"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
