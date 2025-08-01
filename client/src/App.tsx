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

// Pages
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Trails from "@/pages/Trails";
import Beaches from "@/pages/Beaches";
import BoatTours from "@/pages/BoatTours";
import Events from "@/pages/Events";
import Guides from "@/pages/Guides";
import GuideProfile from "@/pages/GuideProfile";
import TrailProfile from "@/pages/TrailProfile";
import BeachProfile from "@/pages/BeachProfile";
import BoatTourProfile from "@/pages/BoatTourProfile";
import EventProfile from "@/pages/EventProfile";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import RegisterNew from "@/pages/RegisterNew";
import Settings from "@/pages/Settings";
import ProfileSelection from "@/pages/ProfileSelection";
import CreateProfile from "@/pages/CreateProfile";
import ComoFunciona from "@/pages/ComoFunciona";
import NossaHistoria from "@/pages/NossaHistoria";
import Parcerias from "@/pages/Parcerias";
import Contato from "@/pages/Contato";
import CentralAjuda from "@/pages/CentralAjuda";
import TermosUso from "@/pages/TermosUso";
import Privacidade from "@/pages/Privacidade";
import ParaEmpresas from "@/pages/ParaEmpresas";
import LoginInstructions from "@/pages/LoginInstructions";
import NotFound from "@/pages/not-found";
import FirebaseLogin from "@/pages/FirebaseLogin";
import ItineraryView from "@/pages/ItineraryView";
import { DevDebugPanel } from "@/components/DevDebugPanel";

function Navigation() {
  const { user, signOut } = useAuth();
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
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">UbatubaIA</span>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side - Theme toggle and User menu */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                {user?.userType === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Administração</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={signOut}
                  className="text-red-600 dark:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Icon className="h-3 w-3" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  const { user, firebaseUser, loading } = useAuth();
  const isAuthenticated = !!user;
  const isLoading = loading;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Navigation />}
      
      <main>
        <Switch>
          {!firebaseUser ? (
            <>
              <Route path="/" component={Landing} />

              <Route path="/register" component={RegisterNew} />
              {/* Páginas do Footer - Disponíveis para usuários não autenticados */}
              <Route path="/como-funciona" component={ComoFunciona} />
              <Route path="/nossa-historia" component={NossaHistoria} />
              <Route path="/parcerias" component={Parcerias} />
              <Route path="/contato" component={Contato} />
              <Route path="/central-ajuda" component={CentralAjuda} />
              <Route path="/termos-uso" component={TermosUso} />
              <Route path="/privacidade" component={Privacidade} />
              <Route path="/para-empresas" component={ParaEmpresas} />
              <Route path="/login-instructions" component={LoginInstructions} />
              <Route component={Landing} />
            </>
          ) : firebaseUser && !user ? (
            <>
              <Route path="/" component={ProfileSelection} />
              <Route path="/profile-selection" component={ProfileSelection} />
              <Route path="/create-profile/:type" component={CreateProfile} />
              {/* Páginas do Footer - Disponíveis durante seleção de perfil */}
              <Route path="/como-funciona" component={ComoFunciona} />
              <Route path="/nossa-historia" component={NossaHistoria} />
              <Route path="/parcerias" component={Parcerias} />
              <Route path="/contato" component={Contato} />
              <Route path="/central-ajuda" component={CentralAjuda} />
              <Route path="/termos-uso" component={TermosUso} />
              <Route path="/privacidade" component={Privacidade} />
              <Route path="/para-empresas" component={ParaEmpresas} />
              <Route component={ProfileSelection} />
            </>
          ) : user && (!user.userType || !user.isProfileComplete) ? (
            <>
              <Route path="/" component={CreateProfile} />
              <Route path="/profile-selection" component={ProfileSelection} />
              <Route path="/create-profile/:type" component={CreateProfile} />
              {/* Páginas do Footer - Disponíveis durante criação de perfil */}
              <Route path="/como-funciona" component={ComoFunciona} />
              <Route path="/nossa-historia" component={NossaHistoria} />
              <Route path="/parcerias" component={Parcerias} />
              <Route path="/contato" component={Contato} />
              <Route path="/central-ajuda" component={CentralAjuda} />
              <Route path="/termos-uso" component={TermosUso} />
              <Route path="/privacidade" component={Privacidade} />
              <Route path="/para-empresas" component={ParaEmpresas} />
              <Route component={CreateProfile} />
            </>
          ) : (
            <>
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
              <Route path="/register" component={RegisterNew} />
              <Route path="/settings" component={Settings} />
              <Route path="/profile-selection" component={ProfileSelection} />
              <Route path="/create-profile/:type" component={CreateProfile} />
              <Route path="/itinerary/:id" component={ItineraryView} />
              <Route path="/admin" component={Admin} />
            </>
          )}
          
          {/* Páginas do Footer - Disponíveis para todos */}
          <Route path="/como-funciona" component={ComoFunciona} />
          <Route path="/nossa-historia" component={NossaHistoria} />
          <Route path="/parcerias" component={Parcerias} />
          <Route path="/contato" component={Contato} />
          <Route path="/central-ajuda" component={CentralAjuda} />
          <Route path="/termos-uso" component={TermosUso} />
          <Route path="/privacidade" component={Privacidade} />
          <Route path="/para-empresas" component={ParaEmpresas} />
          
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {/* Debug panel apenas em desenvolvimento */}
      {isAuthenticated && <DevDebugPanel />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;