import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Ship, Clock, Users, DollarSign, Star, Camera, MessageCircle, Heart, TrendingUp, Fish, Waves, Sunset, Binoculars, Mountain, Anchor, MapPin } from "lucide-react";
import { formatPhone, formatPrice } from "@/lib/masks";

const boatTourSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres").max(500, "Descrição muito longa"),
  duration: z.string().min(1, "Duração é obrigatória"),
  maxPeople: z.string().min(1, "Capacidade máxima é obrigatória"),
  price: z.string().min(1, "Preço é obrigatório"),
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  departureLocation: z.string().min(1, "Local de embarque é obrigatório"),
  includes: z.string().min(1, "Incluso no passeio é obrigatório"),
  whatsappNumber: z.string().optional(),
  imageUrl: z.string().url("URL da imagem deve ser válida").optional().or(z.literal("")),
  isPopular: z.boolean().default(false),
  isRomantic: z.boolean().default(false),
  isFishing: z.boolean().default(false),
  isWhaleWatching: z.boolean().default(false),
  isSunset: z.boolean().default(false),
  isAdventure: z.boolean().default(false),
});

type BoatTourFormData = z.infer<typeof boatTourSchema>;

interface BoatTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour?: any;
}

export default function BoatTourModal({ isOpen, onClose, tour }: BoatTourModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BoatTourFormData>({
    resolver: zodResolver(boatTourSchema),
    defaultValues: {
      name: tour?.name || "",
      description: tour?.description || "",
      duration: tour?.duration?.toString() || "",
      maxPeople: tour?.maxPeople?.toString() || "",
      price: tour?.price || "",
      companyName: tour?.companyName || "",
      departureLocation: tour?.departureLocation || "",
      includes: tour?.includes?.join(", ") || "",
      whatsappNumber: tour?.whatsappNumber || "",
      imageUrl: tour?.imageUrl || "",
      isPopular: tour?.isPopular || false,
      isRomantic: tour?.isRomantic || false,
      isFishing: tour?.isFishing || false,
      isWhaleWatching: tour?.isWhaleWatching || false,
      isSunset: tour?.isSunset || false,
      isAdventure: tour?.isAdventure || false,
    },
  });

  const createTourMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/boat-tours', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boat-tours'] });
      toast({
        title: "Passeio criado!",
        description: "Seu passeio foi cadastrado com sucesso.",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar passeio",
        description: error.message || "Não foi possível criar o passeio.",
        variant: "destructive",
      });
    },
  });

  const updateTourMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/boat-tours/${tour?.id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/boat-tours'] });
      toast({
        title: "Passeio atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar passeio",
        description: error.message || "Não foi possível atualizar o passeio.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BoatTourFormData) => {
    setIsSubmitting(true);
    
    const tourData = {
      ...data,
      duration: parseInt(data.duration),
      maxPeople: parseInt(data.maxPeople),
      price: data.price.replace(/[^\d,]/g, '').replace(',', '.'),
      includes: data.includes.split(',').map(item => item.trim()).filter(item => item.length > 0),
      imageUrl: data.imageUrl || null,
    };

    if (tour) {
      updateTourMutation.mutate(tourData);
    } else {
      createTourMutation.mutate(tourData);
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-ocean" />
            {tour ? "Editar Passeio" : "Novo Passeio de Barco"}
          </DialogTitle>
          <DialogDescription>
            {tour ? "Atualize as informações do seu passeio" : "Cadastre um novo passeio para seus clientes"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome do Passeio */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Ship className="h-4 w-4" />
                    Nome do Passeio
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Passeio às Ilhas Anchieta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o passeio, os pontos visitados e o que está incluído..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Duração */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duração (horas)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Capacidade */}
              <FormField
                control={form.control}
                name="maxPeople"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Capacidade máxima
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preço */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Preço (R$)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 250,00" 
                        {...field} 
                        onChange={(e) => {
                          const formatted = formatPrice(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nome da Empresa */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Ubatuba Mar Turismo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Local de Embarque */}
            <FormField
              control={form.control}
              name="departureLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Local de Embarque
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Marina de Ubatuba, Píer do Saco da Ribeira"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* O que está incluído */}
            <FormField
              control={form.control}
              name="includes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O que está incluído</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: equipamento, almoço, guia, seguro (separado por vírgulas)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* WhatsApp */}
            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp para Reservas
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: (12) 99999-9999"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL da Imagem */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    URL da Imagem (opcional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://exemplo.com/imagem.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checkboxes - Destaques do Passeio */}
            <div className="space-y-4">
              <div className="space-y-1">
                <FormLabel className="text-base font-medium">Destaque do Passeio</FormLabel>
                <p className="text-sm text-muted-foreground">Marque as características especiais do seu passeio</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="isPopular"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className={`
                          flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${field.value 
                            ? 'border-sunset bg-sunset/5 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                          }
                        `}
                        >
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-sunset data-[state=checked]:border-sunset"
                          />
                          <div className="flex items-center gap-2">
                            <TrendingUp className={`h-5 w-5 ${field.value ? 'text-sunset' : 'text-muted-foreground'}`} />
                            <div>
                              <FormLabel className={`font-medium cursor-pointer ${field.value ? 'text-sunset' : 'text-foreground'}`}>
                                Passeio Popular
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">Muito procurado pelos turistas</p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isRomantic"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className={`
                          flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${field.value 
                            ? 'border-pink-400 bg-pink-50 shadow-sm dark:bg-pink-900/10' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                          }
                        `}
                        >
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                          />
                          <div className="flex items-center gap-2">
                            <Heart className={`h-5 w-5 ${field.value ? 'text-pink-500' : 'text-muted-foreground'}`} />
                            <div>
                              <FormLabel className={`font-medium cursor-pointer ${field.value ? 'text-pink-600 dark:text-pink-400' : 'text-foreground'}`}>
                                Passeio Romântico
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">Ideal para casais e momentos especiais</p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFishing"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className={`
                          flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${field.value 
                            ? 'border-blue-400 bg-blue-50 shadow-sm dark:bg-blue-900/10' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                          }
                        `}
                        >
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />
                          <div className="flex items-center gap-2">
                            <Fish className={`h-5 w-5 ${field.value ? 'text-blue-500' : 'text-muted-foreground'}`} />
                            <div>
                              <FormLabel className={`font-medium cursor-pointer ${field.value ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                                Passeio de Pesca
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">Pescaria esportiva e recreativa</p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isWhaleWatching"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className={`
                          flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${field.value 
                            ? 'border-teal-400 bg-teal-50 shadow-sm dark:bg-teal-900/10' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                          }
                        `}
                        >
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                          />
                          <div className="flex items-center gap-2">
                            <Binoculars className={`h-5 w-5 ${field.value ? 'text-teal-500' : 'text-muted-foreground'}`} />
                            <div>
                              <FormLabel className={`font-medium cursor-pointer ${field.value ? 'text-teal-600 dark:text-teal-400' : 'text-foreground'}`}>
                                Avistamento de Baleias
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">Observação da vida marinha</p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isSunset"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className={`
                          flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${field.value 
                            ? 'border-orange-400 bg-orange-50 shadow-sm dark:bg-orange-900/10' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                          }
                        `}
                        >
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                          />
                          <div className="flex items-center gap-2">
                            <Sunset className={`h-5 w-5 ${field.value ? 'text-orange-500' : 'text-muted-foreground'}`} />
                            <div>
                              <FormLabel className={`font-medium cursor-pointer ${field.value ? 'text-orange-600 dark:text-orange-400' : 'text-foreground'}`}>
                                Passeio ao Pôr do Sol
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">Vista espetacular do entardecer</p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAdventure"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className={`
                          flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${field.value 
                            ? 'border-green-400 bg-green-50 shadow-sm dark:bg-green-900/10' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                          }
                        `}
                        >
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                          <div className="flex items-center gap-2">
                            <Mountain className={`h-5 w-5 ${field.value ? 'text-green-500' : 'text-muted-foreground'}`} />
                            <div>
                              <FormLabel className={`font-medium cursor-pointer ${field.value ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                                Passeio Aventura
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">Atividades radicais e exploração</p>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || createTourMutation.isPending || updateTourMutation.isPending}
                className="bg-gradient-to-r from-ocean to-sunset text-white hover:opacity-90"
              >
                {isSubmitting || createTourMutation.isPending || updateTourMutation.isPending
                  ? "Salvando..." 
                  : tour ? "Atualizar Passeio" : "Criar Passeio"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}