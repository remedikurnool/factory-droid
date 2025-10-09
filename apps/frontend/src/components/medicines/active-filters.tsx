"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import type { SearchFilters, Category, Brand } from "@/lib/types/medicine";

interface ActiveFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  categories: Category[];
  brands: Brand[];
}

export function ActiveFilters({
  filters,
  onChange,
  categories,
  brands,
}: ActiveFiltersProps) {
  const activeFilters: { type: string; label: string; onRemove: () => void }[] =
    [];

  // Category filters
  filters.categoryIds?.forEach((categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      activeFilters.push({
        type: "category",
        label: category.name,
        onRemove: () =>
          onChange({
            ...filters,
            categoryIds: filters.categoryIds?.filter((id) => id !== categoryId),
          }),
      });
    }
  });

  // Brand filters
  filters.brandIds?.forEach((brandId) => {
    const brand = brands.find((b) => b.id === brandId);
    if (brand) {
      activeFilters.push({
        type: "brand",
        label: brand.name,
        onRemove: () =>
          onChange({
            ...filters,
            brandIds: filters.brandIds?.filter((id) => id !== brandId),
          }),
      });
    }
  });

  // Price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const minPrice = filters.minPrice ?? 0;
    const maxPrice = filters.maxPrice ?? 5000;
    activeFilters.push({
      type: "price",
      label: `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`,
      onRemove: () =>
        onChange({
          ...filters,
          minPrice: undefined,
          maxPrice: undefined,
        }),
    });
  }

  // Stock filter
  if (filters.inStock) {
    activeFilters.push({
      type: "stock",
      label: "In Stock Only",
      onRemove: () =>
        onChange({
          ...filters,
          inStock: undefined,
        }),
    });
  }

  const clearAll = () => {
    onChange({
      search: filters.search,
    });
  };

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active Filters:</span>
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.type}-${index}`}
          variant="secondary"
          className="gap-1 pr-1"
        >
          {filter.label}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={filter.onRemove}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {filter.label} filter</span>
          </Button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 px-2">
        Clear All
      </Button>
    </div>
  );
}
