import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Calendar, Ship, MapPin, Mountain } from "lucide-react";
import AdminTrails from "@/components/AdminTrails";
import AdminBeaches from "@/components/AdminBeaches";
import AdminBoatTours from "@/components/AdminBoatTours";
import AdminEvents from "@/components/AdminEvents";
import AdminGuides from "@/components/AdminGuides";
import AdminUsers from "@/components/AdminUsers";

export default function Admin() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você precisa estar logado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/firebase-login";
      }, 500);
      return;
    }

    if (!isLoading && isAuthenticated && user?.userType !== 'admin' && !user?.isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem acessar esta página.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  if (isLoading || !isAuthenticated || (user?.userType !== 'admin' && !user?.isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ocean"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-700 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <Shield className="inline h-12 w-12 text-yellow-400 mr-4" />
              Painel Administrativo
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Gerencie todo o conteúdo da plataforma UbatubaIA
            </p>
          </div>
        </div>
      </section>

      {/* Admin Panel */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="trails" className="flex items-center space-x-2">
                <Mountain className="h-4 w-4" />
                <span>Trilhas</span>
              </TabsTrigger>
              <TabsTrigger value="beaches" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Praias</span>
              </TabsTrigger>
              <TabsTrigger value="tours" className="flex items-center space-x-2">
                <Ship className="h-4 w-4" />
                <span>Passeios</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Eventos</span>
              </TabsTrigger>
              <TabsTrigger value="guides" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Guias</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>

            <TabsContent value="trails">
              <AdminTrails />
            </TabsContent>

            <TabsContent value="beaches">
              <AdminBeaches />
            </TabsContent>

            <TabsContent value="tours">
              <AdminBoatTours />
            </TabsContent>

            <TabsContent value="events">
              <AdminEvents />
            </TabsContent>

            <TabsContent value="guides">
              <AdminGuides />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}