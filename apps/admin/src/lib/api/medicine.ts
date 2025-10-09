/**
 * Medicine Management API Client
 * API methods for medicines, categories, and brands
 */

import { apiClient } from './client'
import type {
  Medicine,
  MedicineListResponse,
  CreateMedicineRequest,
  UpdateMedicineRequest,
  MedicineFilters,
  MedicineBulkAction,
  Category,
  CategoryListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryReorderRequest,
  Brand,
  BrandListResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
  ExportMedicinesRequest,
  ExportResponse,
  UploadImageResponse,
  MedicineStats,
} from '@/lib/types/medicine'

export const medicineAPI = {
  // ============ Medicine Management ============

  /**
   * Get paginated list of medicines with filters
   */
  async getMedicines(params: {
    page?: number
    pageSize?: number
    filters?: MedicineFilters
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<MedicineListResponse> {
    const response = await apiClient.get('/admin/medicines', { params })
    return response.data
  },

  /**
   * Get single medicine by ID
   */
  async getMedicine(id: string): Promise<Medicine> {
    const response = await apiClient.get(`/admin/medicines/${id}`)
    return response.data
  },

  /**
   * Create new medicine
   */
  async createMedicine(data: CreateMedicineRequest): Promise<Medicine> {
    const response = await apiClient.post('/admin/medicines', data)
    return response.data
  },

  /**
   * Update existing medicine
   */
  async updateMedicine(id: string, data: UpdateMedicineRequest): Promise<Medicine> {
    const response = await apiClient.put(`/admin/medicines/${id}`, data)
    return response.data
  },

  /**
   * Delete medicine
   */
  async deleteMedicine(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/admin/medicines/${id}`)
    return response.data
  },

  /**
   * Bulk action on medicines
   */
  async bulkActionMedicines(data: MedicineBulkAction): Promise<{ message: string; affected: number }> {
    const response = await apiClient.post('/admin/medicines/bulk-action', data)
    return response.data
  },

  /**
   * Duplicate medicine
   */
  async duplicateMedicine(id: string): Promise<Medicine> {
    const response = await apiClient.post(`/admin/medicines/${id}/duplicate`)
    return response.data
  },

  /**
   * Get medicine statistics
   */
  async getMedicineStats(): Promise<MedicineStats> {
    const response = await apiClient.get('/admin/medicines/stats')
    return response.data
  },

  /**
   * Export medicines to CSV/Excel
   */
  async exportMedicines(data: ExportMedicinesRequest): Promise<ExportResponse> {
    const response = await apiClient.post('/admin/medicines/export', data)
    return response.data
  },

  /**
   * Import medicines from CSV/Excel
   */
  async importMedicines(file: File): Promise<{ message: string; imported: number; errors: string[] }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/admin/medicines/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // ============ Category Management ============

  /**
   * Get all categories with hierarchy
   */
  async getCategories(params?: {
    page?: number
    pageSize?: number
    parentId?: string | null
    isActive?: boolean
  }): Promise<CategoryListResponse> {
    const response = await apiClient.get('/admin/categories', { params })
    return response.data
  },

  /**
   * Get category tree (hierarchical structure)
   */
  async getCategoryTree(): Promise<Category[]> {
    const response = await apiClient.get('/admin/categories/tree')
    return response.data
  },

  /**
   * Get single category by ID
   */
  async getCategory(id: string): Promise<Category> {
    const response = await apiClient.get(`/admin/categories/${id}`)
    return response.data
  },

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.post('/admin/categories', data)
    return response.data
  },

  /**
   * Update existing category
   */
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const response = await apiClient.put(`/admin/categories/${id}`, data)
    return response.data
  },

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/admin/categories/${id}`)
    return response.data
  },

  /**
   * Reorder categories (drag-drop)
   */
  async reorderCategories(data: CategoryReorderRequest[]): Promise<{ message: string }> {
    const response = await apiClient.post('/admin/categories/reorder', data)
    return response.data
  },

  /**
   * Toggle category status
   */
  async toggleCategoryStatus(id: string, isActive: boolean): Promise<Category> {
    const response = await apiClient.patch(`/admin/categories/${id}/toggle`, { isActive })
    return response.data
  },

  // ============ Brand Management ============

  /**
   * Get paginated list of brands
   */
  async getBrands(params?: {
    page?: number
    pageSize?: number
    search?: string
    isActive?: boolean
    isFeatured?: boolean
  }): Promise<BrandListResponse> {
    const response = await apiClient.get('/admin/brands', { params })
    return response.data
  },

  /**
   * Get single brand by ID
   */
  async getBrand(id: string): Promise<Brand> {
    const response = await apiClient.get(`/admin/brands/${id}`)
    return response.data
  },

  /**
   * Create new brand
   */
  async createBrand(data: CreateBrandRequest): Promise<Brand> {
    const response = await apiClient.post('/admin/brands', data)
    return response.data
  },

  /**
   * Update existing brand
   */
  async updateBrand(id: string, data: UpdateBrandRequest): Promise<Brand> {
    const response = await apiClient.put(`/admin/brands/${id}`, data)
    return response.data
  },

  /**
   * Delete brand
   */
  async deleteBrand(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/admin/brands/${id}`)
    return response.data
  },

  /**
   * Toggle brand status
   */
  async toggleBrandStatus(id: string, isActive: boolean): Promise<Brand> {
    const response = await apiClient.patch(`/admin/brands/${id}/toggle`, { isActive })
    return response.data
  },

  /**
   * Toggle brand featured status
   */
  async toggleBrandFeatured(id: string, isFeatured: boolean): Promise<Brand> {
    const response = await apiClient.patch(`/admin/brands/${id}/featured`, { isFeatured })
    return response.data
  },

  // ============ Image Upload ============

  /**
   * Upload image for medicine/category/brand
   */
  async uploadImage(file: File, type: 'medicine' | 'category' | 'brand'): Promise<UploadImageResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    const response = await apiClient.post('/admin/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: File[],
    type: 'medicine' | 'category' | 'brand'
  ): Promise<UploadImageResponse[]> {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    formData.append('type', type)
    const response = await apiClient.post('/admin/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Delete uploaded image
   */
  async deleteImage(url: string): Promise<{ message: string }> {
    const response = await apiClient.delete('/admin/upload/image', {
      data: { url },
    })
    return response.data
  },

  // ============ Search & Suggestions ============

  /**
   * Search medicines (autocomplete)
   */
  async searchMedicines(query: string, limit: number = 10): Promise<Medicine[]> {
    const response = await apiClient.get('/admin/medicines/search', {
      params: { query, limit },
    })
    return response.data
  },

  /**
   * Get medicine suggestions based on partial name
   */
  async getMedicineSuggestions(partial: string): Promise<string[]> {
    const response = await apiClient.get('/admin/medicines/suggestions', {
      params: { partial },
    })
    return response.data
  },

  /**
   * Check SKU availability
   */
  async checkSkuAvailability(sku: string, excludeId?: string): Promise<{ available: boolean }> {
    const response = await apiClient.get('/admin/medicines/check-sku', {
      params: { sku, excludeId },
    })
    return response.data
  },
}
