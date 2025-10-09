/**
 * Marketing Tools API Client
 * API methods for banners, offers, coupons, and notifications
 */

import axios from 'axios'
import type {
  Banner,
  CreateBannerRequest,
  UpdateBannerRequest,
  ReorderBannersRequest,
  BannerStats,
  Offer,
  CreateOfferRequest,
  UpdateOfferRequest,
  OfferStats,
  Coupon,
  CreateCouponRequest,
  UpdateCouponRequest,
  CouponStats,
  CouponUsageLog,
  Notification,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationStats,
  NotificationTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  MarketingAnalytics,
  PaginatedResponse,
  ImageUploadResponse,
  BulkActionRequest,
} from '../types/marketing'

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

// ============ Banner APIs ============

export const bannerAPI = {
  /**
   * Get all banners
   */
  getBanners: async (params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<Banner>> => {
    const response = await api.get('/admin/banners', { params })
    return response.data
  },

  /**
   * Get single banner
   */
  getBanner: async (id: string): Promise<Banner> => {
    const response = await api.get(`/admin/banners/${id}`)
    return response.data
  },

  /**
   * Create banner
   */
  createBanner: async (data: CreateBannerRequest): Promise<Banner> => {
    const response = await api.post('/admin/banners', data)
    return response.data
  },

  /**
   * Update banner
   */
  updateBanner: async (data: UpdateBannerRequest): Promise<Banner> => {
    const response = await api.patch(`/admin/banners/${data.id}`, data)
    return response.data
  },

  /**
   * Delete banner
   */
  deleteBanner: async (id: string): Promise<void> => {
    await api.delete(`/admin/banners/${id}`)
  },

  /**
   * Reorder banners
   */
  reorderBanners: async (data: ReorderBannersRequest): Promise<void> => {
    await api.post('/admin/banners/reorder', data)
  },

  /**
   * Get banner statistics
   */
  getBannerStats: async (): Promise<BannerStats> => {
    const response = await api.get('/admin/banners/stats')
    return response.data
  },

  /**
   * Upload banner image
   */
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await api.post('/admin/banners/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Bulk actions on banners
   */
  bulkAction: async (data: BulkActionRequest): Promise<void> => {
    await api.post('/admin/banners/bulk-action', data)
  },
}

// ============ Offer APIs ============

export const offerAPI = {
  /**
   * Get all offers
   */
  getOffers: async (params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<Offer>> => {
    const response = await api.get('/admin/offers', { params })
    return response.data
  },

  /**
   * Get single offer
   */
  getOffer: async (id: string): Promise<Offer> => {
    const response = await api.get(`/admin/offers/${id}`)
    return response.data
  },

  /**
   * Create offer
   */
  createOffer: async (data: CreateOfferRequest): Promise<Offer> => {
    const response = await api.post('/admin/offers', data)
    return response.data
  },

  /**
   * Update offer
   */
  updateOffer: async (data: UpdateOfferRequest): Promise<Offer> => {
    const response = await api.patch(`/admin/offers/${data.id}`, data)
    return response.data
  },

  /**
   * Delete offer
   */
  deleteOffer: async (id: string): Promise<void> => {
    await api.delete(`/admin/offers/${id}`)
  },

  /**
   * Get offer statistics
   */
  getOfferStats: async (): Promise<OfferStats> => {
    const response = await api.get('/admin/offers/stats')
    return response.data
  },

  /**
   * Bulk actions on offers
   */
  bulkAction: async (data: BulkActionRequest): Promise<void> => {
    await api.post('/admin/offers/bulk-action', data)
  },
}

// ============ Coupon APIs ============

export const couponAPI = {
  /**
   * Get all coupons
   */
  getCoupons: async (params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<Coupon>> => {
    const response = await api.get('/admin/coupons', { params })
    return response.data
  },

  /**
   * Get single coupon
   */
  getCoupon: async (id: string): Promise<Coupon> => {
    const response = await api.get(`/admin/coupons/${id}`)
    return response.data
  },

  /**
   * Create coupon
   */
  createCoupon: async (data: CreateCouponRequest): Promise<Coupon> => {
    const response = await api.post('/admin/coupons', data)
    return response.data
  },

  /**
   * Update coupon
   */
  updateCoupon: async (data: UpdateCouponRequest): Promise<Coupon> => {
    const response = await api.patch(`/admin/coupons/${data.id}`, data)
    return response.data
  },

  /**
   * Delete coupon
   */
  deleteCoupon: async (id: string): Promise<void> => {
    await api.delete(`/admin/coupons/${id}`)
  },

  /**
   * Get coupon statistics
   */
  getCouponStats: async (): Promise<CouponStats> => {
    const response = await api.get('/admin/coupons/stats')
    return response.data
  },

  /**
   * Get coupon usage logs
   */
  getCouponUsage: async (couponId: string, params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<CouponUsageLog>> => {
    const response = await api.get(`/admin/coupons/${couponId}/usage`, { params })
    return response.data
  },

  /**
   * Validate coupon code
   */
  validateCode: async (code: string): Promise<{ isValid: boolean; message?: string }> => {
    const response = await api.post('/admin/coupons/validate', { code })
    return response.data
  },

  /**
   * Generate unique coupon code
   */
  generateCode: async (): Promise<{ code: string }> => {
    const response = await api.get('/admin/coupons/generate-code')
    return response.data
  },

  /**
   * Bulk actions on coupons
   */
  bulkAction: async (data: BulkActionRequest): Promise<void> => {
    await api.post('/admin/coupons/bulk-action', data)
  },

  /**
   * Export coupons
   */
  exportCoupons: async (): Promise<{ url: string }> => {
    const response = await api.get('/admin/coupons/export')
    return response.data
  },
}

// ============ Notification APIs ============

export const notificationAPI = {
  /**
   * Get all notifications
   */
  getNotifications: async (params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get('/admin/notifications', { params })
    return response.data
  },

  /**
   * Get single notification
   */
  getNotification: async (id: string): Promise<Notification> => {
    const response = await api.get(`/admin/notifications/${id}`)
    return response.data
  },

  /**
   * Create notification
   */
  createNotification: async (data: CreateNotificationRequest): Promise<Notification> => {
    const response = await api.post('/admin/notifications', data)
    return response.data
  },

  /**
   * Update notification
   */
  updateNotification: async (data: UpdateNotificationRequest): Promise<Notification> => {
    const response = await api.patch(`/admin/notifications/${data.id}`, data)
    return response.data
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/admin/notifications/${id}`)
  },

  /**
   * Send notification immediately
   */
  sendNotification: async (id: string): Promise<Notification> => {
    const response = await api.post(`/admin/notifications/${id}/send`)
    return response.data
  },

  /**
   * Cancel scheduled notification
   */
  cancelNotification: async (id: string): Promise<Notification> => {
    const response = await api.post(`/admin/notifications/${id}/cancel`)
    return response.data
  },

  /**
   * Get notification statistics
   */
  getNotificationStats: async (): Promise<NotificationStats> => {
    const response = await api.get('/admin/notifications/stats')
    return response.data
  },

  /**
   * Get notification templates
   */
  getTemplates: async (): Promise<NotificationTemplate[]> => {
    const response = await api.get('/admin/notifications/templates')
    return response.data
  },

  /**
   * Create notification template
   */
  createTemplate: async (data: CreateTemplateRequest): Promise<NotificationTemplate> => {
    const response = await api.post('/admin/notifications/templates', data)
    return response.data
  },

  /**
   * Update notification template
   */
  updateTemplate: async (data: UpdateTemplateRequest): Promise<NotificationTemplate> => {
    const response = await api.patch(`/admin/notifications/templates/${data.id}`, data)
    return response.data
  },

  /**
   * Delete notification template
   */
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/admin/notifications/templates/${id}`)
  },

  /**
   * Get user segments count
   */
  getSegmentCount: async (segment: string): Promise<{ count: number }> => {
    const response = await api.get(`/admin/notifications/segments/${segment}/count`)
    return response.data
  },
}

// ============ Marketing Analytics APIs ============

export const marketingAnalyticsAPI = {
  /**
   * Get overall marketing analytics
   */
  getAnalytics: async (): Promise<MarketingAnalytics> => {
    const response = await api.get('/admin/marketing/analytics')
    return response.data
  },

  /**
   * Get revenue impact report
   */
  getRevenueImpact: async (params: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/admin/marketing/revenue-impact', { params })
    return response.data
  },

  /**
   * Export marketing report
   */
  exportReport: async (type: 'banners' | 'offers' | 'coupons' | 'notifications'): Promise<{ url: string }> => {
    const response = await api.get(`/admin/marketing/export/${type}`)
    return response.data
  },
}

// Export combined API
export const marketingAPI = {
  banners: bannerAPI,
  offers: offerAPI,
  coupons: couponAPI,
  notifications: notificationAPI,
  analytics: marketingAnalyticsAPI,
}

export default marketingAPI
