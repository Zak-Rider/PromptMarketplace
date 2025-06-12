import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PromptCard from "@/components/prompt-card";
import CategoryFilter from "@/components/category-filter";
import { Search, Upload, CheckCircle, Clock, Users, DollarSign, Rocket } from "lucide-react";
import type { PromptWithDetails } from "@shared/schema";
import type { MarketplaceStats } from "@/lib/types";

export default function Home() {
  const { data: featuredPrompts = [], isLoading: promptsLoading } = useQuery<PromptWithDetails[]>({
    queryKey: ["/api/prompts?featured=true&limit=3"],
  });

  const { data: stats } = useQuery<MarketplaceStats>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="min-h-screen bg-soft-gray">
      {/* Hero Section */}
      <section className="bg-gradient-oxford-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Discover Premium
                  <span className="text-ut-orange"> AI Prompts</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Buy and sell high-quality prompts for ChatGPT, DALL-E, Midjourney, and more. 
                  Join thousands of creators in the ultimate AI prompt marketplace.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/browse">
                  <Button size="lg" className="bg-ut-orange text-white hover:bg-ut-orange/90 shadow-lg">
                    <Search className="w-5 h-5 mr-2" />
                    Browse Prompts
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-oxford-blue"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Start Selling
                </Button>
              </div>
              
              {stats && (
                <div className="flex items-center space-x-8 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-ut-orange">
                      {stats.totalPrompts.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Prompts Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-ut-orange">
                      {stats.activeUsers.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-ut-orange">
                      {stats.categoriesCount}+
                    </div>
                    <div className="text-sm text-gray-400">Categories</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="AI technology with neural networks and digital interfaces"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ut-orange/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-8 bg-white border-b border-medium-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryFilter
            onCategoryChange={(categoryId) => {
              // This would redirect to browse page with filter in a real app
              console.log("Category selected:", categoryId);
            }}
          />
        </div>
      </section>

      {/* Featured Prompts Section */}
      <section className="py-16 bg-soft-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-oxford-blue mb-4">Featured Prompts</h2>
            <p className="text-xl text-dark-gray max-w-2xl mx-auto">
              Handpicked premium prompts from our top creators
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promptsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/browse">
              <Button size="lg" className="bg-oxford-blue text-white hover:bg-oxford-blue/90">
                View All Prompts
                <Search className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Marketplace Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-oxford-blue mb-4">Why Choose Our Marketplace?</h2>
            <p className="text-xl text-dark-gray max-w-2xl mx-auto">
              Join the fastest-growing AI prompt community
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-oxford-black p-8 rounded-2xl text-white text-center">
              <div className="w-16 h-16 bg-ut-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">100%</h3>
              <p className="text-gray-300">Quality Guaranteed</p>
            </div>
            
            <div className="bg-ut-orange p-8 rounded-2xl text-white text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-ut-orange" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Instant</h3>
              <p className="text-orange-100">Delivery</p>
            </div>
            
            <div className="bg-gradient-oxford-black p-8 rounded-2xl text-white text-center">
              <div className="w-16 h-16 bg-ut-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">50K+</h3>
              <p className="text-gray-300">Active Community</p>
            </div>
            
            <div className="bg-ut-orange p-8 rounded-2xl text-white text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-ut-orange" />
              </div>
              <h3 className="text-2xl font-bold mb-2">$2M+</h3>
              <p className="text-orange-100">Creator Earnings</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-soft-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-oxford-blue mb-4">How It Works</h2>
            <p className="text-xl text-dark-gray max-w-2xl mx-auto">
              Get started in minutes with our simple process
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative mb-8">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                  alt="Digital marketplace interface showcasing AI prompts"
                  className="w-full h-64 object-cover rounded-2xl shadow-lg"
                />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-ut-orange text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold text-oxford-blue mb-3">Browse & Discover</h3>
              <p className="text-dark-gray">
                Explore thousands of high-quality AI prompts across multiple categories and platforms
              </p>
            </div>
            
            <div className="text-center">
              <div className="relative mb-8">
                <img
                  src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                  alt="Creative workspace with prompt writing and testing"
                  className="w-full h-64 object-cover rounded-2xl shadow-lg"
                />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-ut-orange text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold text-oxford-blue mb-3">Purchase & Download</h3>
              <p className="text-dark-gray">
                Secure checkout with instant access to your purchased prompts and detailed instructions
              </p>
            </div>
            
            <div className="text-center">
              <div className="relative mb-8">
                <img
                  src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                  alt="AI technology visualization with neural networks"
                  className="w-full h-64 object-cover rounded-2xl shadow-lg"
                />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-ut-orange text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold text-oxford-blue mb-3">Create & Succeed</h3>
              <p className="text-dark-gray">
                Use your prompts to create amazing content and achieve your goals with AI assistance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="py-16 bg-gradient-to-r from-oxford-blue to-rich-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Start Earning with Your
                <span className="text-ut-orange"> AI Prompts</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Join thousands of creators earning passive income by selling their premium AI prompts. 
                Set your own prices and keep up to 80% of your sales.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-ut-orange flex-shrink-0" />
                  <span className="text-lg">Free to list your prompts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-ut-orange flex-shrink-0" />
                  <span className="text-lg">Keep up to 80% of sales revenue</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-ut-orange flex-shrink-0" />
                  <span className="text-lg">Built-in marketing and promotion</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-ut-orange flex-shrink-0" />
                  <span className="text-lg">Analytics and performance tracking</span>
                </div>
              </div>
              
              <Button size="lg" className="bg-ut-orange text-white hover:bg-ut-orange/90 shadow-lg">
                <Rocket className="w-5 h-5 mr-2" />
                Start Selling Today
              </Button>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500"
                alt="Digital marketplace seller dashboard interface"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ut-orange/10 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
