import { Suspense, lazy } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import AuthProvider, { useAuth } from "@/hooks/useAuth"; // Importação corrigida
import { DevDebugPanel } from "@/components/DevDebugPanel";

// Lazy load pages for code splitting
const Landing = lazy(() => import("@/pages/Landing"));
const Home = lazy(() => import("@/pages/Home"));
const Trails = lazy(() => import("@/pages/Trails"));
const Beaches = lazy(() => import("@/pages/Beaches"));
const BoatTours = lazy(() => import("@/pages/BoatTours"));
const Events = lazy(() => import("@/pages/Events"));
const Guides = lazy(() => import("@/pages/Guides"));
const GuideProfile = lazy(() => import("@/pages/GuideProfile"));
const TrailProfile = lazy(() => import("@/pages/TrailProfile"));
const BeachProfile = lazy(() => import("@/pages/BeachProfile"));
const BoatTourProfile = lazy(() => import("@/pages/BoatTourProfile"));
const EventProfile = lazy(() => import("@/pages/EventProfile"));
const Admin = lazy(() => import("@/pages/Admin"));
const Profile = lazy(() => import("@/pages/Profile"));
const RegisterNew = lazy(() => import("@/pages/RegisterNew"));
const Settings = lazy(() => import("@/pages/Settings"));
const CreateProfile = lazy(() => import("@/pages/CreateProfile"));
const ProfileSelection = lazy(() => import("@/pages/ProfileSelection"));
const ComoFunciona = lazy(() => import("@/pages/ComoFunciona"));
const NossaHistoria = lazy(() => import("@/pages/NossaHistoria"));
const Parcerias = lazy(() => import("@/pages/Parcerias"));
const Contato = lazy(() => import("@/pages/Contato"));
const CentralAjuda = lazy(() => import("@/pages/CentralAjuda"));
const TermosUso = lazy(() => import("@/pages/TermosUso"));
const Privacidade = lazy(() => import("@/pages/Privacidade"));
const ParaEmpresas = lazy(() => import("@/pages/ParaEmpresas"));
const NotFound = lazy(() => import("@/pages/not-found"));
const ItineraryView = lazy(() => import("@/pages/ItineraryView"));


function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isProfileComplete, user, isLoading } = useAuth();

  console.log('Router-isAuthenticated', isAuthenticated)
  console.log('Router-user', user)
  console.log('Router-isLoading', isLoading)

  if (isLoading) {
    return <LoadingFallback />;
  }

  // Estado 1: Usuário Deslogado
  if (!isAuthenticated) {
    return (
      <main>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/register" component={RegisterNew} />
          <Route path="/como-funciona" component={ComoFunciona} />
          <Route path="/nossa-historia" component={NossaHistoria} />
          <Route path="/parcerias" component={Parcerias} />
          <Route path="/contato" component={Contato} />
          <Route path="/central-ajuda" component={CentralAjuda} />
          <Route path="/termos-uso" component={TermosUso} />
          <Route path="/privacidade" component={Privacidade} />
          <Route path="/para-empresas" component={ParaEmpresas} />
          <Route component={Landing} />
        </Switch>
      </main>
    );
  }

  // Estado 2: Usuário Logado, Perfil Incompleto
  if (isAuthenticated && !isProfileComplete) {
    return (
      <main>
        <Switch>
          <Route path="/create-profile/:type" component={CreateProfile} />
          <Route path="/profile-selection" component={ProfileSelection} />
          <Route component={ProfileSelection} />
        </Switch>
      </main>
    );
  }
  
  // Estado 3: Usuário Logado, Perfil Completo
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/trails" component={Trails} />
          <Route path="/beaches" component={Beaches} />
          <Route path="/boat-tours" component={BoatTours} />
          <Route path="/events" component={Events} />
          <Route path="/guides" component={Guides} />
          <Route path="/guides/:identifier" component={GuideProfile} />
          <Route path="/trails/:identifier" component={TrailProfile} />
          <Route path="/beaches/:identifier" component={BeachProfile} />
          <Route path="/boat-tours/:identifier" component={BoatTourProfile} />
          <Route path="/events/:identifier" component={EventProfile} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
          <Route path="/itinerary/:id" component={ItineraryView} />
          {user?.isAdmin && <Route path="/admin" component={Admin} />}
          <Route component={NotFound} />
        </Switch>
      </main>
      {user && <DevDebugPanel />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Router />
          </Suspense>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
