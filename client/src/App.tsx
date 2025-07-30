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
import { useAuth } from "@/hooks/useAuth";
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
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Navigation() {
  const { user } = useAuth();
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
                    <AvatarImage src={user?.profileImageUrl} />
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
                  onClick={() => window.location.href = '/api/logout'}
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
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && !isLoading && <Navigation />}
      
      <main>
        <Switch>
          {isLoading || !isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/trails" component={Trails} />
              <Route path="/beaches" component={Beaches} />
              <Route path="/boat-tours" component={BoatTours} />
              <Route path="/events" component={Events} />
              <Route path="/guides" component={Guides} />
              <Route path="/guides/:id" component={GuideProfile} />
              <Route path="/profile" component={Profile} />
              <Route path="/settings" component={Settings} />
              <Route path="/admin" component={Admin} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;