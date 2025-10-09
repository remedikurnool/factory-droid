"use client";

import { useState, useEffect } from "react";
import { Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/medicines/product-card";
import { ProductCardSkeletonGrid } from "@/components/medicines/skeletons/product-card-skeleton";
import { ProductSearch } from "@/components/medicines/product-search";
import { ProductSort } from "@/components/medicines/product-sort";
import { ProductFilters } from "@/components/medicines/product-filters";
import { ActiveFilters } from "@/components/medicines/active-filters";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { medicineAPI } from "@/lib/api/medicines";
import type {
  Medicine,
  Category,
  Brand,
  SearchFilters,
} from "@/lib/types/medicine";
import { cn } from "@/lib/utils/cn";

type ViewMode = "grid" | "list";

export default function MedicinesPage() {
  // State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Filters and pagination
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const itemsPerPage = 20;

  // Fetch categories and brands on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          medicineAPI.getCategories(),
          medicineAPI.getBrands(),
        ]);
        setCategories(categoriesRes);
        setBrands(brandsRes);
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch medicines when filters, sort, or page changes
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await medicineAPI.searchMedicines({
          ...filters,
          sortBy,
          page: currentPage,
          limit: itemsPerPage,
        });

        setMedicines(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.total);
      } catch (err) {
        setError("Failed to load medicines. Please try again.");
        console.error("Error fetching medicines:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [filters, sortBy, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setFilters({});
    setSortBy("popularity");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Medicines</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our extensive catalog of medicines and healthcare products
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <ProductSearch
          value={filters.search || ""}
          onChange={handleSearchChange}
          placeholder="Search medicines by name, composition, or brand..."
        />
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <ProductFilters
            filters={filters}
            onChange={handleFiltersChange}
            categories={categories}
            brands={brands}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar: Active Filters, Sort, View Toggle */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <ActiveFilters
                filters={filters}
                onChange={handleFiltersChange}
                categories={categories}
                brands={brands}
              />
            </div>
            <div className="flex items-center gap-3">
              <ProductSort value={sortBy} onChange={handleSortChange} />

              {/* View Mode Toggle */}
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          {!loading && medicines.length > 0 && (
            <p className="mb-4 text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              results
            </p>
          )}

          {/* Loading State */}
          {loading && <ProductCardSkeletonGrid count={itemsPerPage} />}

          {/* Error State */}
          {error && !loading && (
            <EmptyState
              type="error"
              description={error}
              action={{
                label: "Try Again",
                onClick: () => window.location.reload(),
              }}
            />
          )}

          {/* No Results State */}
          {!loading && !error && medicines.length === 0 && (
            <EmptyState
              type="no-results"
              action={{
                label: "Clear Filters",
                onClick: handleClearFilters,
              }}
            />
          )}

          {/* Products Grid/List */}
          {!loading && !error && medicines.length > 0 && (
            <>
              <div
                className={cn(
                  viewMode === "grid" &&
                    "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                  viewMode === "list" && "flex flex-col gap-4",
                )}
              >
                {medicines.map((medicine) => (
                  <ProductCard key={medicine.id} medicine={medicine} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
