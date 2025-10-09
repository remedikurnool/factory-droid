/**
 * Medicine Management Types
 * Types for medicine catalog, categories, and brands
 */

// ============ Medicine Types ============

export interface Medicine {
  id: string
  name: string
  genericName?: string
  brand: string
  brandId: string
  manufacturer: string
  composition: string
  category: string
  categoryId: string
  description: string
  dosageForm: DosageForm
  strength: string
  packSize: string
  images: string[]
  thumbnail: string
  mrp: number
  sellingPrice: number
  discount: number
  stockQuantity: number
  minStockLevel: number
  sku: string
  barcode?: string
  prescriptionRequired: boolean
  status: MedicineStatus
  publishedAt?: string
  createdAt: string
  updatedAt: string
  
  // SEO fields
  metaTitle?: string
  metaDescription?: string
  slug: string
  
  // Additional details
  storageInstructions?: string
  usageInstructions?: string
  sideEffects?: string
  warnings?: string
  contraindications?: string
  expiryDate?: string
  batchNumber?: string
  
  // Flags
  isFeatured: boolean
  isNewArrival: boolean
  isBestseller: boolean
  
  // Analytics
  views: number
  orders: number
  rating: number
  reviewCount: number
}

export enum DosageForm {
  TABLET = 'TABLET',
  CAPSULE = 'CAPSULE',
  SYRUP = 'SYRUP',
  INJECTION = 'INJECTION',
  CREAM = 'CREAM',
  OINTMENT = 'OINTMENT',
  DROPS = 'DROPS',
  INHALER = 'INHALER',
  POWDER = 'POWDER',
  SUSPENSION = 'SUSPENSION',
  GEL = 'GEL',
  LOTION = 'LOTION',
  SPRAY = 'SPRAY',
  PATCH = 'PATCH',
  SUPPOSITORY = 'SUPPOSITORY',
  OTHER = 'OTHER',
}

export enum MedicineStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
}

export interface CreateMedicineRequest {
  name: string
  genericName?: string
  brandId: string
  manufacturer: string
  composition: string
  categoryId: string
  description: string
  dosageForm: DosageForm
  strength: string
  packSize: string
  images: string[]
  mrp: number
  sellingPrice: number
  stockQuantity: number
  minStockLevel: number
  sku: string
  barcode?: string
  prescriptionRequired: boolean
  status: MedicineStatus
  metaTitle?: string
  metaDescription?: string
  storageInstructions?: string
  usageInstructions?: string
  sideEffects?: string
  warnings?: string
  contraindications?: string
  expiryDate?: string
  batchNumber?: string
  isFeatured?: boolean
  isNewArrival?: boolean
  isBestseller?: boolean
}

export interface UpdateMedicineRequest extends Partial<CreateMedicineRequest> {}

export interface MedicineFilters {
  search?: string
  categoryId?: string
  brandId?: string
  status?: MedicineStatus
  dosageForm?: DosageForm
  prescriptionRequired?: boolean
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  isFeatured?: boolean
  isNewArrival?: boolean
  isBestseller?: boolean
}

export interface MedicineBulkAction {
  medicineIds: string[]
  action: 'PUBLISH' | 'UNPUBLISH' | 'DELETE' | 'FEATURE' | 'UNFEATURE'
}

// ============ Category Types ============

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  icon?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  order: number
  isActive: boolean
  metaTitle?: string
  metaDescription?: string
  productCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  image?: string
  icon?: string
  parentId?: string
  order?: number
  isActive?: boolean
  metaTitle?: string
  metaDescription?: string
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CategoryReorderRequest {
  categoryId: string
  newOrder: number
  newParentId?: string
}

// ============ Brand Types ============

export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
  isFeatured: boolean
  metaTitle?: string
  metaDescription?: string
  productCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateBrandRequest {
  name: string
  description?: string
  logo?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  isActive?: boolean
  isFeatured?: boolean
  metaTitle?: string
  metaDescription?: string
}

export interface UpdateBrandRequest extends Partial<CreateBrandRequest> {}

// ============ Pagination & Response Types ============

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface MedicineListResponse extends PaginatedResponse<Medicine> {}
export interface CategoryListResponse extends PaginatedResponse<Category> {}
export interface BrandListResponse extends PaginatedResponse<Brand> {}

// ============ Export Types ============

export interface ExportMedicinesRequest {
  format: 'CSV' | 'EXCEL'
  filters?: MedicineFilters
  fields?: string[]
}

export interface ExportResponse {
  url: string
  filename: string
  expiresAt: string
}

// ============ Upload Types ============

export interface UploadImageRequest {
  file: File
  type: 'medicine' | 'category' | 'brand'
}

export interface UploadImageResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}

// ============ Statistics Types ============

export interface MedicineStats {
  totalProducts: number
  publishedProducts: number
  draftProducts: number
  outOfStockProducts: number
  lowStockProducts: number
  totalCategories: number
  totalBrands: number
  totalValue: number
}
