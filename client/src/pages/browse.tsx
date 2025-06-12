import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PromptCard from "@/components/prompt-card";
import CategoryFilter from "@/components/category-filter";
import { Search, Filter, Grid, List } from "lucide-react";
import type { PromptWithDetails } from "@shared/schema";
import type { SearchFilters } from "@/lib/types";

export default function Browse() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Parse URL params on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const categoryId = params.get('categoryId');
    const search = params.get('search');
    const featured = params.get('featured');
    const trending = params.get('trending');
    const isNew = params.get('isNew');

    setSelectedCategoryId(categoryId ? parseInt(categoryId) : undefined);
    setSearchQuery(search || '');
    setFilters({
      search: search || undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      featured: featured === 'true' ? true : undefined,
      trending: trending === 'true' ? true : undefined,
      isNew: isNew === 'true' ? true : undefined,
    });
  }, [location]);

  const { data: prompts = [], isLoading, error } = useQuery<PromptWithDetails[]>({
    queryKey: ["/api/prompts", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
      if (filters.trending !== undefined) params.append('trending', filters.trending.toString());
      if (filters.isNew !== undefined) params.append('isNew', filters.isNew.toString());
      
      const url = `/api/prompts${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  const handleSearch = () => {
    const newFilters = {
      ...filters,
      search: searchQuery || undefined,
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleCategoryChange = (categoryId?: number) => {
    setSelectedCategoryId(categoryId);
    const newFilters = {
      ...filters,
      categoryId,
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const updateURL = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) params.append('search', newFilters.search);
    if (newFilters.categoryId) params.append('categoryId', newFilters.categoryId.toString());
    if (newFilters.featured) params.append('featured', 'true');
    if (newFilters.trending) params.append('trending', 'true');
    if (newFilters.isNew) params.append('isNew', 'true');
    
    const newPath = `/browse${params.toString() ? `?${params.toString()}` : ''}`;
    setLocation(newPath);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(undefined);
    setFilters({});
    setLocation('/browse');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-soft-gray flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Prompts</h1>
            <p className="text-dark-gray mb-4">
              {error instanceof Error ? error.message : 'Failed to load prompts'}
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
      {/* Header */}
      <div className="bg-white border-b border-medium-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-oxford-blue mb-4">Browse AI Prompts</h1>
            <p className="text-xl text-dark-gray max-w-2xl mx-auto">
              Discover thousands of premium AI prompts for every creative need
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 max-w-2xl mx-auto mb-8">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search prompts, categories, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-3 text-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-gray" />
            </div>
            <Button onClick={handleSearch} size="lg" className="bg-ut-orange text-white hover:bg-ut-orange/90">
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {/* Category Filter */}
          <CategoryFilter
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </div>

      {/* Filters & Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.featured ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('featured', !filters.featured ? true : undefined)}
              className={filters.featured ? "bg-ut-orange text-white" : ""}
            >
              Featured
            </Button>
            <Button
              variant={filters.trending ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('trending', !filters.trending ? true : undefined)}
              className={filters.trending ? "bg-oxford-blue text-white" : ""}
            >
              Trending
            </Button>
            <Button
              variant={filters.isNew ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('isNew', !filters.isNew ? true : undefined)}
              className={filters.isNew ? "bg-green-500 text-white" : ""}
            >
              New
            </Button>
            
            {(filters.search || filters.categoryId || filters.featured || filters.trending || filters.isNew) && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-gray">
              {prompts.length} results
            </span>
            <div className="flex border border-medium-gray rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-oxford-blue text-white' : ''}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-oxford-blue text-white' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.search || selectedCategoryId) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.search && (
              <Badge variant="secondary" className="bg-oxford-blue text-white">
                Search: "{filters.search}"
              </Badge>
            )}
            {selectedCategoryId && (
              <Badge variant="secondary" className="bg-ut-orange text-white">
                Category Filter Active
              </Badge>
            )}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
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
        ) : prompts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-oxford-blue mb-2">No prompts found</h3>
            <p className="text-dark-gray mb-6">
              Try adjusting your search criteria or browse different categories
            </p>
            <Button onClick={clearAllFilters} className="bg-ut-orange text-white hover:bg-ut-orange/90">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
