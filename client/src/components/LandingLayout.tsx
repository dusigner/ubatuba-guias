import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { 
  Compass, 
  Mountain, 
  Umbrella, 
  Ship, 
  Calendar, 
  Users, 
  Heart,
  Home
} from "lucide-react";

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  // Scroll para o topo quando a página carregar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Navegação suave para landing page
  const scrollToSection = (sectionId: string) => {
    // Se não estamos na landing page, navegar para ela primeiro
    if (window.location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Compass className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">UbatubaIA</span>
              </div>
            </Link>
            
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('inicio')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Home className="h-4 w-4" />
                Início
              </button>
              <button onClick={() => scrollToSection('trilhas')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mountain className="h-4 w-4" />
                Trilhas
              </button>
              <button onClick={() => scrollToSection('praias')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Umbrella className="h-4 w-4" />
                Praias
              </button>
              <button onClick={() => scrollToSection('passeios')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Ship className="h-4 w-4" />
                Passeios
              </button>
              <button onClick={() => scrollToSection('guias')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Users className="h-4 w-4" />
                Guias
              </button>
              <button onClick={() => scrollToSection('eventos')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Calendar className="h-4 w-4" />
                Eventos
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button 
                onClick={() => window.location.href = '/firebase-login'}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Users className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Compass className="h-8 w-8 text-ocean" />
                <span className="text-2xl font-bold">UbatubaIA</span>
              </div>
              <p className="text-slate-400 mb-4">
                Sua plataforma inteligente para descobrir o melhor de Ubatuba com roteiros personalizados por IA.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => scrollToSection('trilhas')} className="hover:text-white transition-colors">Trilhas</button></li>
                <li><button onClick={() => scrollToSection('praias')} className="hover:text-white transition-colors">Praias</button></li>
                <li><button onClick={() => scrollToSection('passeios')} className="hover:text-white transition-colors">Passeios</button></li>
                <li><button onClick={() => scrollToSection('eventos')} className="hover:text-white transition-colors">Eventos</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Sobre</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/como-funciona" className="hover:text-white transition-colors" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>Como Funciona</Link></li>
                <li><Link href="/nossa-historia" className="hover:text-white transition-colors" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>Nossa História</Link></li>
                <li><Link href="/parcerias" className="hover:text-white transition-colors" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>Parcerias</Link></li>
                <li><Link href="/contato" className="hover:text-white transition-colors" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>Contato</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/central-ajuda" className="hover:text-white transition-colors" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>Central de Ajuda</Link></li>
                <li><Link href="/termos-uso" className="hover:text-white transition-colors" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-white transition-colors" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>Privacidade</Link></li>
                <li><Link href="/para-empresas" className="hover:text-white transition-colors" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>Para Empresas</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 UbatubaIA. Todos os direitos reservados. Desenvolvido com <Heart className="inline h-4 w-4 text-red-500" /> para Ubatuba.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}