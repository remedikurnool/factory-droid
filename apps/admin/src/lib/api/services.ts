/**
 * Lab Tests & Services API Client
 * API methods for lab tests, homecare services, and doctors
 */

import axios from 'axios'
import type {
  LabTest,
  CreateLabTestRequest,
  UpdateLabTestRequest,
  LabTestFilters,
  LabTestListResponse,
  LabTestCategory,
  LabTestStats,
  HomecareService,
  CreateHomecareServiceRequest,
  UpdateHomecareServiceRequest,
  HomecareServiceFilters,
  HomecareServiceListResponse,
  ServiceCategory,
  HomecareServiceStats,
  ServiceProvider,
  Doctor,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  DoctorFilters,
  DoctorListResponse,
  Specialization,
  ClinicHospital,
  DoctorStats,
  BulkAction,
  ExportRequest,
  ExportResponse,
} from '../types/services'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ============ Lab Test APIs ============

export const labTestAPI = {
  /**
   * Get paginated list of lab tests
   */
  getLabTests: async (params: {
    page: number
    pageSize: number
    filters?: LabTestFilters
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<LabTestListResponse> => {
    const response = await api.get('/admin/lab-tests', { params })
    return response.data
  },

  /**
   * Get single lab test by ID
   */
  getLabTest: async (id: string): Promise<LabTest> => {
    const response = await api.get(`/admin/lab-tests/${id}`)
    return response.data
  },

  /**
   * Create new lab test
   */
  createLabTest: async (data: CreateLabTestRequest): Promise<LabTest> => {
    const response = await api.post('/admin/lab-tests', data)
    return response.data
  },

  /**
   * Update existing lab test
   */
  updateLabTest: async (id: string, data: UpdateLabTestRequest): Promise<LabTest> => {
    const response = await api.put(`/admin/lab-tests/${id}`, data)
    return response.data
  },

  /**
   * Delete lab test
   */
  deleteLabTest: async (id: string): Promise<void> => {
    await api.delete(`/admin/lab-tests/${id}`)
  },

  /**
   * Bulk action on lab tests
   */
  bulkActionLabTests: async (data: BulkAction): Promise<void> => {
    await api.post('/admin/lab-tests/bulk-action', data)
  },

  /**
   * Get lab test statistics
   */
  getLabTestStats: async (): Promise<LabTestStats> => {
    const response = await api.get('/admin/lab-tests/stats')
    return response.data
  },

  /**
   * Export lab tests
   */
  exportLabTests: async (request: ExportRequest): Promise<ExportResponse> => {
    const response = await api.post('/admin/lab-tests/export', request)
    return response.data
  },

  /**
   * Import lab tests
   */
  importLabTests: async (file: File): Promise<{ imported: number; errors: string[] }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/admin/lab-tests/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Get test categories
   */
  getCategories: async (): Promise<LabTestCategory[]> => {
    const response = await api.get('/admin/lab-tests/categories')
    return response.data
  },

  /**
   * Create test package
   */
  createPackage: async (data: CreateLabTestRequest): Promise<LabTest> => {
    const response = await api.post('/admin/lab-tests/packages', data)
    return response.data
  },

  /**
   * Get package tests
   */
  getPackageTests: async (packageId: string): Promise<LabTest[]> => {
    const response = await api.get(`/admin/lab-tests/packages/${packageId}/tests`)
    return response.data
  },
}

// ============ Homecare Service APIs ============

export const homecareServiceAPI = {
  /**
   * Get paginated list of homecare services
   */
  getHomecareServices: async (params: {
    page: number
    pageSize: number
    filters?: HomecareServiceFilters
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<HomecareServiceListResponse> => {
    const response = await api.get('/admin/homecare-services', { params })
    return response.data
  },

  /**
   * Get single homecare service by ID
   */
  getHomecareService: async (id: string): Promise<HomecareService> => {
    const response = await api.get(`/admin/homecare-services/${id}`)
    return response.data
  },

  /**
   * Create new homecare service
   */
  createHomecareService: async (data: CreateHomecareServiceRequest): Promise<HomecareService> => {
    const response = await api.post('/admin/homecare-services', data)
    return response.data
  },

  /**
   * Update existing homecare service
   */
  updateHomecareService: async (id: string, data: UpdateHomecareServiceRequest): Promise<HomecareService> => {
    const response = await api.put(`/admin/homecare-services/${id}`, data)
    return response.data
  },

  /**
   * Delete homecare service
   */
  deleteHomecareService: async (id: string): Promise<void> => {
    await api.delete(`/admin/homecare-services/${id}`)
  },

  /**
   * Bulk action on homecare services
   */
  bulkActionHomecareServices: async (data: BulkAction): Promise<void> => {
    await api.post('/admin/homecare-services/bulk-action', data)
  },

  /**
   * Get homecare service statistics
   */
  getHomecareServiceStats: async (): Promise<HomecareServiceStats> => {
    const response = await api.get('/admin/homecare-services/stats')
    return response.data
  },

  /**
   * Export homecare services
   */
  exportHomecareServices: async (request: ExportRequest): Promise<ExportResponse> => {
    const response = await api.post('/admin/homecare-services/export', request)
    return response.data
  },

  /**
   * Import homecare services
   */
  importHomecareServices: async (file: File): Promise<{ imported: number; errors: string[] }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/admin/homecare-services/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Get service categories
   */
  getCategories: async (): Promise<ServiceCategory[]> => {
    const response = await api.get('/admin/homecare-services/categories')
    return response.data
  },

  /**
   * Get service providers
   */
  getProviders: async (serviceId?: string): Promise<ServiceProvider[]> => {
    const response = await api.get('/admin/service-providers', {
      params: { serviceId },
    })
    return response.data
  },

  /**
   * Assign provider to service
   */
  assignProvider: async (serviceId: string, providerId: string): Promise<void> => {
    await api.post(`/admin/homecare-services/${serviceId}/providers`, { providerId })
  },

  /**
   * Remove provider from service
   */
  removeProvider: async (serviceId: string, providerId: string): Promise<void> => {
    await api.delete(`/admin/homecare-services/${serviceId}/providers/${providerId}`)
  },

  /**
   * Update service availability
   */
  updateAvailability: async (serviceId: string, availability: any): Promise<void> => {
    await api.put(`/admin/homecare-services/${serviceId}/availability`, availability)
  },
}

// ============ Doctor APIs ============

export const doctorAPI = {
  /**
   * Get paginated list of doctors
   */
  getDoctors: async (params: {
    page: number
    pageSize: number
    filters?: DoctorFilters
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<DoctorListResponse> => {
    const response = await api.get('/admin/doctors', { params })
    return response.data
  },

  /**
   * Get single doctor by ID
   */
  getDoctor: async (id: string): Promise<Doctor> => {
    const response = await api.get(`/admin/doctors/${id}`)
    return response.data
  },

  /**
   * Create new doctor
   */
  createDoctor: async (data: CreateDoctorRequest): Promise<Doctor> => {
    const response = await api.post('/admin/doctors', data)
    return response.data
  },

  /**
   * Update existing doctor
   */
  updateDoctor: async (id: string, data: UpdateDoctorRequest): Promise<Doctor> => {
    const response = await api.put(`/admin/doctors/${id}`, data)
    return response.data
  },

  /**
   * Delete doctor
   */
  deleteDoctor: async (id: string): Promise<void> => {
    await api.delete(`/admin/doctors/${id}`)
  },

  /**
   * Bulk action on doctors
   */
  bulkActionDoctors: async (data: BulkAction): Promise<void> => {
    await api.post('/admin/doctors/bulk-action', data)
  },

  /**
   * Get doctor statistics
   */
  getDoctorStats: async (): Promise<DoctorStats> => {
    const response = await api.get('/admin/doctors/stats')
    return response.data
  },

  /**
   * Export doctors
   */
  exportDoctors: async (request: ExportRequest): Promise<ExportResponse> => {
    const response = await api.post('/admin/doctors/export', request)
    return response.data
  },

  /**
   * Import doctors
   */
  importDoctors: async (file: File): Promise<{ imported: number; errors: string[] }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/admin/doctors/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Get specializations
   */
  getSpecializations: async (): Promise<Specialization[]> => {
    const response = await api.get('/admin/specializations')
    return response.data
  },

  /**
   * Get clinics/hospitals
   */
  getClinicsHospitals: async (): Promise<ClinicHospital[]> => {
    const response = await api.get('/admin/clinics-hospitals')
    return response.data
  },

  /**
   * Update doctor schedule
   */
  updateSchedule: async (doctorId: string, schedule: any): Promise<void> => {
    await api.put(`/admin/doctors/${doctorId}/schedule`, schedule)
  },

  /**
   * Update doctor commission
   */
  updateCommission: async (doctorId: string, commission: any): Promise<void> => {
    await api.put(`/admin/doctors/${doctorId}/commission`, commission)
  },

  /**
   * Toggle doctor status
   */
  toggleStatus: async (doctorId: string, status: string): Promise<void> => {
    await api.patch(`/admin/doctors/${doctorId}/status`, { status })
  },

  /**
   * Get doctor consultations
   */
  getConsultations: async (doctorId: string, params?: any): Promise<any> => {
    const response = await api.get(`/admin/doctors/${doctorId}/consultations`, { params })
    return response.data
  },

  /**
   * Get doctor earnings
   */
  getEarnings: async (doctorId: string, params?: any): Promise<any> => {
    const response = await api.get(`/admin/doctors/${doctorId}/earnings`, { params })
    return response.data
  },
}

// Export combined API
export const servicesAPI = {
  labTests: labTestAPI,
  homecare: homecareServiceAPI,
  doctors: doctorAPI,
}

export default servicesAPI
