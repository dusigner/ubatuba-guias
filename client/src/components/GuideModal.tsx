import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Award, Languages, MapPin, Loader2 } from "lucide-react";

const guideSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  specialties: z.array(z.string()).min(1, "Selecione pelo menos uma especialidade"),
  languages: z.array(z.string()).min(1, "Selecione pelo menos um idioma"),
  experienceYears: z.number().min(1, "Experiência deve ser pelo menos 1 ano").max(50, "Máximo 50 anos"),
  certifications: z.array(z.string()),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  location: z.string().min(3, "Local é obrigatório"),
});

type GuideFormData = z.infer<typeof guideSchema>;

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<GuideFormData>({
    resolver: zodResolver(guideSchema),
    defaultValues: {
      name: user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user?.email || "",
      description: "",
      specialties: [],
      languages: ["Português"],
      experienceYears: 1,
      certifications: [],
      whatsapp: "",
      instagram: "",
      location: "Ubatuba, SP",
    },
  });

  const createGuideMutation = useMutation({
    mutationFn: async (guideData: GuideFormData) => {
      const response = await apiRequest('POST', '/api/guides', guideData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      toast({
        title: "Perfil de guia criado com sucesso!",
        description: "Seu perfil já está visível para os turistas interessados.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro ao criar perfil",
        description: "Houve um problema ao cadastrar seu perfil de guia. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GuideFormData) => {
    createGuideMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const specialtyOptions = [
    { value: "trilhas", label: "Trilhas e Caminhadas", icon: "🥾" },
    { value: "mergulho", label: "Mergulho e Esportes Aquáticos", icon: "🤿" },
    { value: "história", label: "História e Cultura Local", icon: "📚" },
    { value: "fotografia", label: "Fotografia e Paisagismo", icon: "📸" },
    { value: "ecoturismo", label: "Ecoturismo e Natureza", icon: "🌿" },
    { value: "aventura", label: "Turismo de Aventura", icon: "🏃‍♂️" },
    { value: "gastronomia", label: "Gastronomia Local", icon: "🍽️" },
    { value: "família", label: "Turismo Familiar", icon: "👨‍👩‍👧‍👦" },
  ];

  const languageOptions = [
    { value: "Português", label: "Português" },
    { value: "Inglês", label: "Inglês" },
    { value: "Espanhol", label: "Espanhol" },
    { value: "Francês", label: "Francês" },
    { value: "Italiano", label: "Italiano" },
    { value: "Alemão", label: "Alemão" },
  ];

  const certificationOptions = [
    { value: "PADI", label: "PADI (Mergulho)" },
    { value: "ABETA", label: "ABETA (Ecoturismo)" },
    { value: "CADASTUR", label: "CADASTUR" },
    { value: "Primeiros Socorros", label: "Primeiros Socorros" },
    { value: "Condutor Ambiental", label: "Condutor Ambiental" },
    { value: "Guia de Turismo", label: "Guia de Turismo Credenciado" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Users className="h-6 w-6 text-tropical mr-2" />
            Cadastrar-se como Guia
          </DialogTitle>
          <DialogDescription>
            Crie seu perfil profissional e conecte-se com turistas em Ubatuba
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ubatuba, SP" {...field} />
                      </FormControl>
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
                    <FormLabel>Apresentação Pessoal *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Conte sobre sua experiência, paixão pelo turismo, conhecimentos locais, etc."
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
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anos de Experiência *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="50"
                        placeholder="Quantos anos de experiência como guia?"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Specialties */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 flex items-center">
                <Award className="h-5 w-5 mr-2 text-sunset" />
                Especialidades
              </h3>
              
              <FormField
                control={form.control}
                name="specialties"
                render={() => (
                  <FormItem>
                    <div className="grid md:grid-cols-2 gap-3">
                      {specialtyOptions.map((specialty) => (
                        <FormField
                          key={specialty.value}
                          control={form.control}
                          name="specialties"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={specialty.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(specialty.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, specialty.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== specialty.value
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  <span className="mr-2">{specialty.icon}</span>
                                  {specialty.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Languages */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 flex items-center">
                <Languages className="h-5 w-5 mr-2 text-ocean" />
                Idiomas
              </h3>
              
              <FormField
                control={form.control}
                name="languages"
                render={() => (
                  <FormItem>
                    <div className="grid md:grid-cols-3 gap-3">
                      {languageOptions.map((language) => (
                        <FormField
                          key={language.value}
                          control={form.control}
                          name="languages"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={language.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(language.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, language.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== language.value
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {language.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Certifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
                Certificações (Opcional)
              </h3>
              
              <FormField
                control={form.control}
                name="certifications"
                render={() => (
                  <FormItem>
                    <div className="grid md:grid-cols-2 gap-3">
                      {certificationOptions.map((cert) => (
                        <FormField
                          key={cert.value}
                          control={form.control}
                          name="certifications"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={cert.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(cert.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, cert.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== cert.value
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {cert.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
                Contato (Opcional)
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="(12) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="@seu_instagram" {...field} />
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
                disabled={createGuideMutation.isPending}
                className="bg-gradient-to-r from-tropical to-ocean text-white hover:opacity-90"
              >
                {createGuideMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Cadastrar Perfil
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
