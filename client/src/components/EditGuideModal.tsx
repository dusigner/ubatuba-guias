import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatPhone } from "@/lib/masks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EditGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide: any; // Guide with user data joined
}

const editGuideSchema = z.object({
  bio: z.string().min(10, "Bio deve ter pelo menos 10 caracteres"),
  experience: z.string().optional(), // Tornar opcional para permitir string vazia
  specialties: z.string().optional(), // Tornar opcional 
  languages: z.string().optional(), // Tornar opcional
  hourlyRate: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  imageUrl: z.string().optional(),
});

type EditGuideFormData = z.infer<typeof editGuideSchema>;

const availableSpecialties = [
  'Trilhas', 'Ecoturismo', 'História Local', 'Aventura', 'Fotografia', 
  'Observação de Aves', 'Mergulho', 'Pesca Esportiva', 'Gastronomia', 
  'Cultura Caiçara', 'Turismo Rural', 'Turismo Religioso'
];

const availableLanguages = [
  'Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Alemão'
];

export default function EditGuideModal({ isOpen, onClose, guide }: EditGuideModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    Array.isArray(guide.specialties) ? guide.specialties : 
    (guide.specialties ? guide.specialties.split(',').map((s: string) => s.trim()) : [])
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    Array.isArray(guide.languages) ? guide.languages :
    (guide.languages ? guide.languages.split(',').map((s: string) => s.trim()) : ['Português'])
  );

  const form = useForm<EditGuideFormData>({
    resolver: zodResolver(editGuideSchema),
    defaultValues: {
      bio: guide.bio || "",
      experience: guide.experience || "",
      specialties: Array.isArray(guide.specialties) ? guide.specialties.join(', ') : (guide.specialties || ""),
      languages: Array.isArray(guide.languages) ? guide.languages.join(', ') : (guide.languages || "Português"),
      hourlyRate: guide.hourlyRate?.toString() || "",
      whatsapp: guide.whatsapp || "",
      instagram: guide.instagram || "",
      imageUrl: guide.imageUrl || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: EditGuideFormData) => {
      console.log("=== MUTATION FUNCTION CALLED ===");
      const formData = {
        ...data,
        specialties: selectedSpecialties.join(', '),
        languages: selectedLanguages.join(', '),
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
      };
      
      console.log("Final form data to send:", formData);
      console.log("API endpoint:", `/api/guides/${guide.id}`);
      
      return await apiRequest(`/api/guides/${guide.id}`, 'PUT', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      queryClient.invalidateQueries({ queryKey: [`/api/guides/${guide.id}`] });
      toast({
        title: "Sucesso!",
        description: "Perfil de guia atualizado com sucesso.",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      
      toast({
        title: "Erro",
        description: "Falha ao atualizar perfil de guia. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditGuideFormData) => {
    console.log("=== EDIT GUIDE MODAL SUBMIT ===");
    console.log("Form data:", data);
    console.log("Selected specialties:", selectedSpecialties);
    console.log("Selected languages:", selectedLanguages);
    console.log("Guide ID:", guide.id);
    console.log("Mutation pending:", mutation.isPending);
    
    mutation.mutate(data);
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-ocean">
            Editar Perfil de Guia
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Conte sobre você, sua experiência e paixão por Ubatuba..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experiência</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva sua experiência como guia turístico..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Especialidades</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableSpecialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant={selectedSpecialties.includes(specialty) ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleSpecialty(specialty)}
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <FormLabel>Idiomas</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableLanguages.map((language) => (
                  <Badge
                    key={language}
                    variant={selectedLanguages.includes(language) ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleLanguage(language)}
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Serviço - Opcional</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: R$ 150,00 por passeio"
                      {...field}
                      onChange={(e) => {
                        // Simple currency formatting without importing formatCurrency
                        let value = e.target.value.replace(/\D/g, '');
                        if (value) {
                          value = (parseInt(value) / 100).toFixed(2);
                          value = `R$ ${value.replace('.', ',')}`;
                        }
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(12) 99999-9999"
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

            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="@seuinstagram"
                      {...field}
                    />
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
                  <FormLabel>URL da Foto de Perfil</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://exemplo.com/foto.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="flex-1 bg-ocean hover:bg-ocean/90"
                onClick={(e) => {
                  console.log("=== BOTÃO SALVAR CLICADO ===");
                  console.log("Form valid:", form.formState.isValid);
                  console.log("Form errors:", form.formState.errors);
                  console.log("Form values:", form.getValues());
                  console.log("Mutation pending:", mutation.isPending);
                  
                  // Força validação
                  form.trigger().then((isValid) => {
                    console.log("Form válido após trigger:", isValid);
                    console.log("Erros após trigger:", form.formState.errors);
                  });
                }}
              >
                {mutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}