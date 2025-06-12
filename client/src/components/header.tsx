import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Brain, Search, Heart, ShoppingCart, Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { PromptWithDetails } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const navigateToAuth = (mode: 'login' | 'signup') => {
    setLocation(`/auth?mode=${mode}`);
  };

  const { data: cartItems = [] } = useQuery<PromptWithDetails[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: favorites = [] } = useQuery<PromptWithDetails[]>({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className="bg-white shadow-sm border-b border-medium-gray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-oxford-orange rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-oxford-blue">Buy Sell Prompt</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/browse">
                <Button variant="ghost" className="text-oxford-blue hover:text-ut-orange font-medium">
                  Browse
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="ghost" className="text-oxford-blue hover:text-ut-orange font-medium">
                  Categories
                </Button>
              </Link>
              <Button variant="ghost" className="text-oxford-blue hover:text-ut-orange font-medium">
                Sell Prompts
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block relative">
              <Input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-ut-orange focus:border-ut-orange"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-dark-gray" />
            </div>
            
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="relative text-oxford-blue hover:text-ut-orange">
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-ut-orange text-white text-xs rounded-full flex items-center justify-center p-0">
                    {favorites.length}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-oxford-blue hover:text-ut-orange">
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-ut-orange text-white text-xs rounded-full flex items-center justify-center p-0">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <div className="hidden sm:flex items-center space-x-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-oxford-blue hover:text-ut-orange">
                      <User className="w-4 h-4" />
                      <span>{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="border-oxford-blue text-oxford-blue hover:bg-oxford-blue hover:text-white"
                    onClick={() => navigateToAuth('login')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="bg-ut-orange text-white hover:bg-ut-orange/90"
                    onClick={() => navigateToAuth('signup')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-oxford-blue"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-medium-gray">
          <div className="px-4 py-2 space-y-2">
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-ut-orange focus:border-ut-orange"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-dark-gray" />
            </div>
            
            <Link href="/browse">
              <Button variant="ghost" className="w-full justify-start text-oxford-blue hover:text-ut-orange font-medium">
                Browse
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="ghost" className="w-full justify-start text-oxford-blue hover:text-ut-orange font-medium">
                Categories
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start text-oxford-blue hover:text-ut-orange font-medium">
              Sell Prompts
            </Button>
            
            <div className="flex space-x-2 pt-4">
              {user ? (
                <Button 
                  variant="outline" 
                  className="flex-1 border-oxford-blue text-oxford-blue hover:bg-oxford-blue hover:text-white"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-oxford-blue text-oxford-blue hover:bg-oxford-blue hover:text-white"
                    onClick={() => navigateToAuth('login')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="flex-1 bg-ut-orange text-white hover:bg-ut-orange/90"
                    onClick={() => navigateToAuth('signup')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
