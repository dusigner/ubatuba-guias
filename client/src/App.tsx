import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Trails from "@/pages/Trails";
import Beaches from "@/pages/Beaches";
import BoatTours from "@/pages/BoatTours";
import Events from "@/pages/Events";
import Guides from "@/pages/Guides";
import NotFound from "@/pages/not-found";
import Admin from "@/pages/Admin";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
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
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
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
