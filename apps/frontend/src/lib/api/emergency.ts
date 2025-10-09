/**
 * Emergency Services API Client
 * API methods for ambulance booking and blood bank services
 */

import { apiClient } from './client'
import type {
  AmbulanceBooking,
  AmbulanceBookingRequest,
  AmbulanceCostEstimate,
  BloodBank,
  BloodBankSearchParams,
  EmergencyContact,
  TrackingUpdate,
  Location,
} from '../types/emergency'

export const emergencyAPI = {
  // ==================== Ambulance Services ====================

  /**
   * Get cost estimate for ambulance booking
   */
  getAmbulanceCostEstimate: async (data: {
    ambulanceType: string
    pickupLocation: Location
    dropLocation: Location
  }): Promise<AmbulanceCostEstimate> => {
    const response = await apiClient.post('/emergency/ambulance/estimate', data)
    return response.data
  },

  /**
   * Create ambulance booking
   */
  bookAmbulance: async (
    data: AmbulanceBookingRequest
  ): Promise<AmbulanceBooking> => {
    const response = await apiClient.post('/emergency/ambulance/book', data)
    return response.data
  },

  /**
   * Get all ambulance bookings for user
   */
  getAmbulanceBookings: async (params?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<{
    bookings: AmbulanceBooking[]
    total: number
    page: number
    limit: number
  }> => {
    const response = await apiClient.get('/emergency/ambulance/bookings', {
      params,
    })
    return response.data
  },

  /**
   * Get ambulance booking by ID
   */
  getAmbulanceBookingById: async (id: string): Promise<AmbulanceBooking> => {
    const response = await apiClient.get(`/emergency/ambulance/bookings/${id}`)
    return response.data
  },

  /**
   * Track ambulance in real-time
   */
  trackAmbulance: async (
    bookingId: string
  ): Promise<{
    currentLocation: { latitude: number; longitude: number }
    status: string
    estimatedArrival: string
    updates: TrackingUpdate[]
  }> => {
    const response = await apiClient.get(
      `/emergency/ambulance/bookings/${bookingId}/track`
    )
    return response.data
  },

  /**
   * Cancel ambulance booking
   */
  cancelAmbulanceBooking: async (data: {
    bookingId: string
    reason: string
  }): Promise<AmbulanceBooking> => {
    const response = await apiClient.post(
      `/emergency/ambulance/bookings/${data.bookingId}/cancel`,
      { reason: data.reason }
    )
    return response.data
  },

  // ==================== Blood Banks ====================

  /**
   * Search blood banks
   */
  searchBloodBanks: async (
    params?: BloodBankSearchParams
  ): Promise<{
    bloodBanks: BloodBank[]
    total: number
    page: number
    limit: number
  }> => {
    const response = await apiClient.get('/emergency/blood-banks', { params })
    return response.data
  },

  /**
   * Get blood bank by ID
   */
  getBloodBankById: async (id: string): Promise<BloodBank> => {
    const response = await apiClient.get(`/emergency/blood-banks/${id}`)
    return response.data
  },

  /**
   * Get nearby blood banks
   */
  getNearbyBloodBanks: async (data: {
    latitude: number
    longitude: number
    radius?: number
    bloodGroup?: string
  }): Promise<BloodBank[]> => {
    const response = await apiClient.post('/emergency/blood-banks/nearby', data)
    return response.data
  },

  /**
   * Check blood availability at specific blood bank
   */
  checkBloodAvailability: async (data: {
    bloodBankId: string
    bloodGroup: string
  }): Promise<{
    available: boolean
    unitsAvailable?: number
    lastUpdated: string
  }> => {
    const response = await apiClient.post(
      '/emergency/blood-banks/check-availability',
      data
    )
    return response.data
  },

  // ==================== Emergency Contacts ====================

  /**
   * Get all emergency contacts
   */
  getEmergencyContacts: async (params?: {
    category?: string
    location?: string
  }): Promise<EmergencyContact[]> => {
    const response = await apiClient.get('/emergency/contacts', { params })
    return response.data
  },

  /**
   * Get emergency contacts by category
   */
  getEmergencyContactsByCategory: async (
    category: string
  ): Promise<EmergencyContact[]> => {
    const response = await apiClient.get(
      `/emergency/contacts/category/${category}`
    )
    return response.data
  },

  /**
   * Call emergency number (initiates call through app)
   */
  callEmergency: async (contactId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/emergency/contacts/${contactId}/call`)
    return response.data
  },
}
