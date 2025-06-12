import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PromptCard from "@/components/prompt-card";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { PromptWithDetails } from "@shared/schema";

export default function Favorites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading, error } = useQuery<PromptWithDetails[]>({
    queryKey: ["/api/favorites"],
  });

  const clearFavoritesMutation = useMutation({
    mutationFn: async () => {
      // Remove all favorites individually since we don't have a bulk delete endpoint
      await Promise.all(
        favorites.map(fav => apiRequest("DELETE", `/api/favorites/${fav.id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Favorites cleared",
        description: "All items removed from your favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear favorites",
        variant: "destructive",
      });
    },
  });

  if (error) {
    return (
      <div className="min-h-screen bg-soft-gray flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Favorites</h1>
            <p className="text-dark-gray mb-4">
              {error instanceof Error ? error.message : 'Failed to load favorites'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/browse">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-oxford-blue">My Favorites</h1>
            <p className="text-dark-gray">
              {favorites.length} {favorites.length === 1 ? 'prompt' : 'prompts'} saved to your favorites
            </p>
          </div>
          {favorites.length > 0 && (
            <Button
              variant="outline"
              onClick={() => clearFavoritesMutation.mutate()}
              disabled={clearFavoritesMutation.isPending}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💝</div>
            <h3 className="text-2xl font-semibold text-oxford-blue mb-2">No favorites yet</h3>
            <p className="text-dark-gray mb-6">
              Start exploring and save your favorite AI prompts for easy access later
            </p>
            <Link href="/browse">
              <Button className="bg-ut-orange text-white hover:bg-ut-orange/90">
                <Heart className="w-5 h-5 mr-2" />
                Discover Prompts
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-oxford-blue mb-1">
                    {favorites.length}
                  </div>
                  <div className="text-sm text-dark-gray">Total Favorites</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-ut-orange mb-1">
                    ${favorites.reduce((sum, fav) => sum + parseFloat(fav.price), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-dark-gray">Total Value</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {new Set(favorites.map(fav => fav.category.name)).size}
                  </div>
                  <div className="text-sm text-dark-gray">Categories</div>
                </CardContent>
              </Card>
            </div>

            {/* Favorites Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favorites.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <h3 className="text-xl font-semibold text-oxford-blue mb-4">
                Ready to start creating?
              </h3>
              <p className="text-dark-gray mb-6">
                Add your favorite prompts to cart and unlock their full potential
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/cart">
                  <Button className="bg-ut-orange text-white hover:bg-ut-orange/90">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    View Cart
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button variant="outline" className="border-oxford-blue text-oxford-blue hover:bg-oxford-blue hover:text-white">
                    Browse More Prompts
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
