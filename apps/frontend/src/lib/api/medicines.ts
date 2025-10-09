import { apiClient } from './client'
import type {
  Medicine,
  MedicineListResponse,
  SearchFilters,
  Category,
  Brand,
} from '../types/medicine'

export const medicineApi = {
  /**
   * Search medicines with filters
   */
  search: async (filters: SearchFilters): Promise<MedicineListResponse> => {
    const { data } = await apiClient.get<MedicineListResponse>('/medicines/search', {
      params: filters,
    })
    return data
  },

  /**
   * Get medicine by ID
   */
  getById: async (id: string): Promise<Medicine> => {
    const { data } = await apiClient.get<Medicine>(`/medicines/${id}`)
    return data
  },

  /**
   * Get medicine by slug
   */
  getBySlug: async (slug: string): Promise<Medicine> => {
    const { data } = await apiClient.get<Medicine>(`/medicines/slug/${slug}`)
    return data
  },

  /**
   * Get popular medicines
   */
  getPopular: async (limit: number = 10): Promise<Medicine[]> => {
    const { data } = await apiClient.get<Medicine[]>('/medicines/popular', {
      params: { limit },
    })
    return data
  },

  /**
   * Get featured medicines
   */
  getFeatured: async (limit: number = 10): Promise<Medicine[]> => {
    const { data} = await apiClient.get<Medicine[]>('/medicines/featured', {
      params: { limit },
    })
    return data
  },

  /**
   * Get categories
   */
  getCategories: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/medicines/categories')
    return data
  },

  /**
   * Get brands
   */
  getBrands: async (): Promise<Brand[]> => {
    const { data } = await apiClient.get<Brand[]>('/medicines/brands')
    return data
  },

  /**
   * Get similar medicines
   */
  getSimilar: async (medicineId: string, limit: number = 6): Promise<Medicine[]> => {
    const { data } = await apiClient.get<Medicine[]>(
      `/medicines/${medicineId}/similar`,
      {
        params: { limit },
      }
    )
    return data
  },

  /**
   * Get generic alternatives
   */
  getAlternatives: async (medicineId: string): Promise<Medicine[]> => {
    const { data } = await apiClient.get<Medicine[]>(
      `/medicines/${medicineId}/alternatives`
    )
    return data
  },
}

export default medicineApi
