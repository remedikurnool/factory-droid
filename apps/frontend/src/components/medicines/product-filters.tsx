"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { SearchFilters, Category, Brand } from "@/lib/types/medicine";

interface ProductFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  categories: Category[];
  brands: Brand[];
  className?: string;
}

export function ProductFilters({
  filters,
  onChange,
  categories,
  brands,
  className,
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    stock: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = filters.categoryIds || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];
    onChange({ ...filters, categoryIds: newCategories });
  };

  const handleBrandToggle = (brandId: string) => {
    const currentBrands = filters.brandIds || [];
    const newBrands = currentBrands.includes(brandId)
      ? currentBrands.filter((id) => id !== brandId)
      : [...currentBrands, brandId];
    onChange({ ...filters, brandIds: newBrands });
  };

  const handlePriceChange = (values: number[]) => {
    onChange({
      ...filters,
      minPrice: values[0],
      maxPrice: values[1],
    });
  };

  const handleStockToggle = (inStock: boolean) => {
    onChange({ ...filters, inStock: inStock ? true : undefined });
  };

  const clearAllFilters = () => {
    onChange({
      search: filters.search,
    });
  };

  const hasActiveFilters =
    (filters.categoryIds?.length ?? 0) > 0 ||
    (filters.brandIds?.length ?? 0) > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStock !== undefined;

  return (
    <Card className={cn("sticky top-4", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Filters</CardTitle>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 text-xs"
          >
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Categories Filter */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("categories")}
            className="flex w-full items-center justify-between text-sm font-semibold"
          >
            <span>Categories</span>
            {expandedSections.categories ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.categories && (
            <div className="mt-3 space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categoryIds?.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Brands Filter */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("brands")}
            className="flex w-full items-center justify-between text-sm font-semibold"
          >
            <span>Brands</span>
            {expandedSections.brands ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.brands && (
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={filters.brandIds?.includes(brand.id)}
                    onCheckedChange={() => handleBrandToggle(brand.id)}
                  />
                  <label
                    htmlFor={`brand-${brand.id}`}
                    className="flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {brand.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("price")}
            className="flex w-full items-center justify-between text-sm font-semibold"
          >
            <span>Price Range</span>
            {expandedSections.price ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.price && (
            <div className="mt-3 space-y-3">
              <Slider
                min={0}
                max={5000}
                step={50}
                value={[filters.minPrice ?? 0, filters.maxPrice ?? 5000]}
                onValueChange={handlePriceChange}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatCurrency(filters.minPrice ?? 0)}</span>
                <span>{formatCurrency(filters.maxPrice ?? 5000)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Stock Availability Filter */}
        <div className="pb-2">
          <button
            onClick={() => toggleSection("stock")}
            className="flex w-full items-center justify-between text-sm font-semibold"
          >
            <span>Availability</span>
            {expandedSections.stock ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.stock && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStock === true}
                  onCheckedChange={(checked) =>
                    handleStockToggle(checked as boolean)
                  }
                />
                <label
                  htmlFor="in-stock"
                  className="cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  In Stock Only
                </label>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
