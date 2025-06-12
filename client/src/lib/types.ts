export interface SearchFilters {
  search?: string;
  categoryId?: number;
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
  limit?: number;
  offset?: number;
}

export interface MarketplaceStats {
  totalPrompts: number;
  activeUsers: number;
  categoriesCount: number;
  totalEarnings: string;
}
