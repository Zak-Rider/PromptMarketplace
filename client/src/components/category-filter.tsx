import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

interface CategoryFilterProps {
  selectedCategoryId?: number;
  onCategoryChange: (categoryId?: number) => void;
}

export default function CategoryFilter({ selectedCategoryId, onCategoryChange }: CategoryFilterProps) {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-3 justify-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 w-24 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button
        className={`px-6 py-3 rounded-full font-medium transition-all ${
          !selectedCategoryId
            ? "bg-oxford-blue text-white"
            : "bg-soft-gray text-oxford-blue hover:bg-ut-orange hover:text-white"
        }`}
        onClick={() => onCategoryChange(undefined)}
      >
        All Categories
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            selectedCategoryId === category.id
              ? "bg-oxford-blue text-white"
              : "bg-soft-gray text-oxford-blue hover:bg-ut-orange hover:text-white"
          }`}
          onClick={() => onCategoryChange(category.id)}
        >
          <i className={`${category.icon} mr-2`}></i>
          {category.name}
        </Button>
      ))}
    </div>
  );
}
