import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { User } from "@shared/schema";
import { X } from "lucide-react";

const editGuideSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  bio: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  specialties: z.string().min(1, "Especialidades são obrigatórias"),
  languages: z.string().min(1, "Idiomas são obrigatórios"),
  experience: z.string().min(5, "Experiência deve ser descrita"),
  location: z.string().min(3, "Local é obrigatório"),
  phone: z.string().optional(),
  profileImageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type EditGuideFormData = z.infer<typeof editGuideSchema>;

interface EditGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide: User;
}

const availableSpecialties = [
  'Trilhas', 'Ecoturismo', 'História Local', 'Fotografia', 'Mergulho',
  'Snorkeling', 'Turismo Rural', 'Gastronomia', 'Artesanato Local'
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
      specialties: guide.specialties || "",
      languages: guide.languages || "Português",
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
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Perfil atualizado com sucesso!",
        description: "Suas informações foram atualizadas.",
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
          <DialogTitle className="flex items-center gap-2">
            Editar Perfil de Guia
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
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
                  <FormLabel>Descrição Profissional</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Conte sobre sua experiência como guia, áreas de especialidade e o que torna seus passeios únicos..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Especialidades */}
            <div>
              <FormLabel>Especialidades</FormLabel>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {availableSpecialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                    className="justify-center cursor-pointer hover:bg-ocean/10"
                    onClick={() => toggleSpecialty(specialty)}
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
              {selectedSpecialties.length === 0 && (
                <p className="text-sm text-destructive mt-1">Selecione pelo menos uma especialidade</p>
              )}
            </div>

            {/* Idiomas */}
            <div>
              <FormLabel>Idiomas que Fala</FormLabel>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {availableLanguages.map((language) => (
                  <Badge
                    key={language}
                    variant={selectedLanguages.includes(language) ? "default" : "outline"}
                    className="justify-center cursor-pointer hover:bg-tropical/10"
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
                  <FormLabel>Experiência e Qualificações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: 10 anos como guia, formação em turismo, certificações..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Ubatuba, SP" {...field} />
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
                    <FormLabel>WhatsApp (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(12) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="profileImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Foto de Perfil (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateGuideMutation.isPending || selectedSpecialties.length === 0}
                className="bg-gradient-to-r from-ocean to-sunset hover:from-ocean/90 hover:to-sunset/90"
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