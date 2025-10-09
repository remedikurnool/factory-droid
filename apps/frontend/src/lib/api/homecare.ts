/**
 * Homecare Services API Client
 * API methods for homecare services and bookings
 */

import { apiClient } from './client'
import type {
  HomecareService,
  HomecareBooking,
  ServiceSearchParams,
  BookingSearchParams,
  PatientDetails,
  ExtendBookingRequest,
  CancelBookingRequest,
  RateCaretakerRequest,
  RequestReplacementRequest,
  Caretaker,
  BookingReview,
} from '../types/homecare'

export const homecareAPI = {
  // ==================== Services ====================
  
  /**
   * Get all homecare services with filters
   */
  getServices: async (
    params?: ServiceSearchParams
  ): Promise<{
    services: HomecareService[]
    total: number
    page: number
    limit: number
  }> => {
    const response = await apiClient.get('/homecare/services', { params })
    return response.data
  },

  /**
   * Get service by ID
   */
  getServiceById: async (id: string): Promise<HomecareService> => {
    const response = await apiClient.get(`/homecare/services/${id}`)
    return response.data
  },

  /**
   * Get service categories
   */
  getCategories: async (): Promise<
    Array<{ category: string; count: number }>
  > => {
    const response = await apiClient.get('/homecare/categories')
    return response.data
  },

  // ==================== Bookings ====================

  /**
   * Create a new booking
   */
  createBooking: async (data: {
    serviceId: string
    pricingOptionId: string
    patientDetails: PatientDetails
    addressId: string
    startDate: string
    startTime: string
    specialRequirements?: string
  }): Promise<HomecareBooking> => {
    const response = await apiClient.post('/homecare/bookings', data)
    return response.data
  },

  /**
   * Get all bookings for user
   */
  getBookings: async (
    params?: BookingSearchParams
  ): Promise<{
    bookings: HomecareBooking[]
    total: number
    page: number
    limit: number
  }> => {
    const response = await apiClient.get('/homecare/bookings', { params })
    return response.data
  },

  /**
   * Get booking by ID
   */
  getBookingById: async (id: string): Promise<HomecareBooking> => {
    const response = await apiClient.get(`/homecare/bookings/${id}`)
    return response.data
  },

  /**
   * Extend booking
   */
  extendBooking: async (data: ExtendBookingRequest): Promise<HomecareBooking> => {
    const response = await apiClient.post(
      `/homecare/bookings/${data.bookingId}/extend`,
      data
    )
    return response.data
  },

  /**
   * Cancel booking
   */
  cancelBooking: async (data: CancelBookingRequest): Promise<HomecareBooking> => {
    const response = await apiClient.post(
      `/homecare/bookings/${data.bookingId}/cancel`,
      data
    )
    return response.data
  },

  /**
   * Rate caretaker
   */
  rateCaretaker: async (data: RateCaretakerRequest): Promise<BookingReview> => {
    const response = await apiClient.post(
      `/homecare/bookings/${data.bookingId}/rate`,
      data
    )
    return response.data
  },

  /**
   * Request replacement caretaker
   */
  requestReplacement: async (
    data: RequestReplacementRequest
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(
      `/homecare/bookings/${data.bookingId}/request-replacement`,
      data
    )
    return response.data
  },

  // ==================== Caretakers ====================

  /**
   * Get caretaker details
   */
  getCaretaker: async (id: string): Promise<Caretaker> => {
    const response = await apiClient.get(`/homecare/caretakers/${id}`)
    return response.data
  },

  /**
   * Get caretaker reviews
   */
  getCaretakerReviews: async (
    caretakerId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{
    reviews: BookingReview[]
    total: number
    page: number
    limit: number
  }> => {
    const response = await apiClient.get(
      `/homecare/caretakers/${caretakerId}/reviews`,
      { params }
    )
    return response.data
  },

  // ==================== Availability ====================

  /**
   * Check service availability
   */
  checkAvailability: async (data: {
    serviceId: string
    date: string
    time: string
    pincode: string
  }): Promise<{
    available: boolean
    message?: string
    alternativeSlots?: Array<{ date: string; time: string }>
  }> => {
    const response = await apiClient.post('/homecare/check-availability', data)
    return response.data
  },
}
