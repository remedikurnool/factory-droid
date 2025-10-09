export interface Medicine {
  id: string;
  name: string;
  slug: string;
  genericName?: string;
  description?: string;
  manufacturer: string;
  brandId?: string;
  brand?: Brand;
  categoryId: string;
  category: Category;
  subcategoryId?: string;
  subcategory?: Category;
  composition: string;
  dosageForm: string;
  strength: string;
  packSize: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  prescriptionRequired: boolean;
  stock: number;
  minStockLevel: number;
  images: string[];
  uses?: string[];
  sideEffects?: string[];
  dosageInstructions?: string;
  warnings?: string[];
  storageInstructions?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  marketedBy?: string;
  tags?: string[];
  isPopular: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isActive: boolean;
  averageRating?: number;
  reviewCount?: number;
  viewCount?: number;
  orderCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  prescriptionRequired?: boolean;
  inStock?: boolean;
  dosageForm?: string;
  sortBy?: "price-asc" | "price-desc" | "popularity" | "discount" | "name";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export type MedicineListResponse = PaginatedResponse<Medicine>;

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}
