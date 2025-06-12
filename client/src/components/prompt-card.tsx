import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart, ShoppingCart, Star, Check } from "lucide-react";
import type { PromptWithDetails } from "@shared/schema";

interface PromptCardProps {
  prompt: PromptWithDetails;
}

export default function PromptCard({ prompt }: PromptCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/favorites/${prompt.id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { promptId: prompt.id });
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: isLiked ? "Removed from favorites" : "Added to favorites",
        description: isLiked ? "Prompt removed from your favorites" : "Prompt added to your favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", { promptId: prompt.id });
    },
    onSuccess: () => {
      setIsAddedToCart(true);
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Prompt added to your cart successfully",
      });
      
      // Reset button state after 2 seconds
      setTimeout(() => {
        setIsAddedToCart(false);
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage = error.message.includes("Already in cart") 
        ? "This prompt is already in your cart" 
        : "Failed to add to cart";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < fullStars ? "text-ut-orange fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    
    return stars;
  };

  const getBadgeContent = () => {
    if (prompt.featured) return { text: "Featured", className: "bg-ut-orange text-white" };
    if (prompt.trending) return { text: "Trending", className: "bg-oxford-blue text-white" };
    if (prompt.isNew) return { text: "New", className: "bg-green-500 text-white" };
    return null;
  };

  const badge = getBadgeContent();

  return (
    <Card className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
      <div className="relative">
        <img
          src={prompt.previewImage || "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"}
          alt={prompt.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badge && (
          <div className="absolute top-4 left-4">
            <Badge className={badge.className}>{badge.text}</Badge>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 bg-white/90 rounded-full hover:bg-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteMutation.mutate();
            }}
            disabled={toggleFavoriteMutation.isPending}
          >
            <Heart className={`w-4 h-4 transition-colors ${isLiked ? "text-ut-orange fill-current" : "text-dark-gray hover:text-ut-orange"}`} />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="bg-soft-gray text-oxford-blue">
            {prompt.category.name}
          </Badge>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              {renderStars(parseFloat(prompt.rating || "0"))}
            </div>
            <span className="text-sm text-dark-gray ml-1">
              {parseFloat(prompt.rating || "0").toFixed(1)}
            </span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-oxford-blue mb-2 line-clamp-2">
          {prompt.title}
        </h3>
        <p className="text-dark-gray text-sm mb-4 line-clamp-2">
          {prompt.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-oxford-orange text-white text-xs">
                {prompt.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-oxford-blue">
              {prompt.author.username}
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-oxford-blue">
              ${parseFloat(prompt.price).toFixed(2)}
            </div>
            <div className="text-xs text-dark-gray">
              {prompt.salesCount} sales
            </div>
          </div>
        </div>
        
        <Button
          className="w-full bg-ut-orange text-white hover:bg-ut-orange/90 transition-colors font-medium"
          onClick={(e) => {
            e.stopPropagation();
            addToCartMutation.mutate();
          }}
          disabled={addToCartMutation.isPending || isAddedToCart}
        >
          {isAddedToCart ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
