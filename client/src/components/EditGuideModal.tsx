import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { User } from "@shared/schema";
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
  guide: User;
}

const editGuideSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  bio: z.string().min(10, "Bio deve ter pelo menos 10 caracteres"),
  experience: z.string().min(1, "Experiência é obrigatória"),
  location: z.string().min(1, "Localização é obrigatória"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  profileImageUrl: z.string().optional(),
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
    guide.specialties ? guide.specialties.split(',').map(s => s.trim()) : []
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    guide.languages ? guide.languages.split(',').map(s => s.trim()) : ['Português']
  );

  const form = useForm<EditGuideFormData>({
    resolver: zodResolver(editGuideSchema),
    defaultValues: {
      firstName: guide.firstName || "",
      lastName: guide.lastName || "",
      bio: guide.bio || "",
      experience: guide.experience || "",
      location: guide.location || "Ubatuba, SP",
      phone: guide.phone || "",
      profileImageUrl: guide.profileImageUrl || "",
    },
  });

  const updateGuideMutation = useMutation({
    mutationFn: async (guideData: EditGuideFormData) => {
      const response = await apiRequest(`/api/guides/${guide.id}`, 'PUT', {
        ...guideData,
        specialties: selectedSpecialties.join(', '),
        languages: selectedLanguages.join(', '),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Perfil atualizado com sucesso!",
        description: "Suas informações foram atualizadas.",
      });
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
        title: "Erro ao atualizar perfil",
        description: "Houve um problema ao atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditGuideFormData) => {
    updateGuideMutation.mutate(data);
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
          <DialogTitle>Editar Perfil de Guia</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu sobrenome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Conte um pouco sobre você, sua experiência e paixão por Ubatuba..."
                      className="min-h-[100px]"
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
                {availableSpecialties.map(specialty => (
                  <Badge
                    key={specialty}
                    variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-ocean/20"
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
                {availableLanguages.map(language => (
                  <Badge
                    key={language}
                    variant={selectedLanguages.includes(language) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-tropical/20"
                    onClick={() => toggleLanguage(language)}
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experiência</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva sua experiência como guia, certificações, cursos..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="Ubatuba, SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(12) 99999-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateGuideMutation.isPending}
                className="bg-gradient-to-r from-tropical to-ocean text-white hover:opacity-90"
              >
                {updateGuideMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}