import { Suspense, lazy } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  Waves,
  Mountain,
  Ship,
  Calendar,
  Users,
  MapPin,
  Shield,
  Home as HomeIcon
} from "lucide-react";
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

function Navigation() {
  const { dbUser, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Início", icon: HomeIcon },
    { path: "/trails", label: "Trilhas", icon: Mountain },
    { path: "/beaches", label: "Praias", icon: Waves },
    { path: "/boat-tours", label: "Passeios", icon: Ship },
    { path: "/events", label: "Eventos", icon: Calendar },
    { path: "/guides", label: "Guias", icon: Users },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">UbatubaIA</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={dbUser?.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {dbUser?.firstName?.[0]}{dbUser?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="p-2">
                  <p className="font-medium">{dbUser?.firstName} {dbUser?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{dbUser?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 h-4 w-4" /><span>Perfil</span></Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/settings"><SettingsIcon className="mr-2 h-4 w-4" /><span>Configurações</span></Link></DropdownMenuItem>
                {dbUser?.isAdmin && (<>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/admin"><Shield className="mr-2 h-4 w-4" /><span>Administração</span></Link></DropdownMenuItem>
                </>)}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400"><LogOut className="mr-2 h-4 w-4" /><span>Sair</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  const { firebaseUser, dbUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }

  // Estado 1: Usuário Deslogado
  if (!firebaseUser) {
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
  if (firebaseUser && !dbUser?.isProfileComplete) {
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
          {dbUser?.isAdmin && <Route path="/admin" component={Admin} />}
          <Route component={NotFound} />
        </Switch>
      </main>
      {dbUser && <DevDebugPanel />}
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
