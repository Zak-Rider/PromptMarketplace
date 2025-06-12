import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Home from "@/pages/home";
import Browse from "@/pages/browse";
import Cart from "@/pages/cart";
import Favorites from "@/pages/favorites";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleNavigateToDashboard = () => {
      setLocation("/dashboard");
    };

    window.addEventListener('navigate-to-dashboard', handleNavigateToDashboard);

    return () => {
      window.removeEventListener('navigate-to-dashboard', handleNavigateToDashboard);
    };
  }, [setLocation]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse" component={Browse} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/cart" component={Cart} />
      <ProtectedRoute path="/favorites" component={Favorites} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="min-h-screen bg-soft-gray">
            <Header />
            <main>
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
