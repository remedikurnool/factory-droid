import { apiClient } from './client'
import type { Order, Address, DeliverySlot, Coupon } from '@/lib/types/order'

export const orderAPI = {
  // Orders
  async createOrder(data: {
    addressId: string
    deliverySlotId?: string
    paymentMethod: string
    couponCode?: string
    notes?: string
  }): Promise<Order> {
    const response = await apiClient.post('/orders', data)
    return response.data
  },

  async getOrders(params?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<{
    data: Order[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const response = await apiClient.get('/orders', { params })
    return response.data
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data
  },

  async cancelOrder(id: string, reason: string): Promise<Order> {
    const response = await apiClient.post(`/orders/${id}/cancel`, { reason })
    return response.data
  },

  async trackOrder(id: string): Promise<Order> {
    const response = await apiClient.get(`/orders/${id}/track`)
    return response.data
  },

  async downloadInvoice(id: string): Promise<Blob> {
    const response = await apiClient.get(`/orders/${id}/invoice`, {
      responseType: 'blob',
    })
    return response.data
  },

  async reorder(id: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/orders/${id}/reorder`)
    return response.data
  },

  // Addresses
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get('/addresses')
    return response.data
  },

  async getAddressById(id: string): Promise<Address> {
    const response = await apiClient.get(`/addresses/${id}`)
    return response.data
  },

  async createAddress(data: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    const response = await apiClient.post('/addresses', data)
    return response.data
  },

  async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
    const response = await apiClient.put(`/addresses/${id}`, data)
    return response.data
  },

  async deleteAddress(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/addresses/${id}`)
    return response.data
  },

  async setDefaultAddress(id: string): Promise<Address> {
    const response = await apiClient.post(`/addresses/${id}/set-default`)
    return response.data
  },

  // Delivery Slots
  async getDeliverySlots(date?: string): Promise<DeliverySlot[]> {
    const response = await apiClient.get('/delivery-slots', {
      params: { date },
    })
    return response.data
  },

  // Coupons
  async validateCoupon(code: string, cartTotal: number): Promise<Coupon> {
    const response = await apiClient.post('/coupons/validate', {
      code,
      cartTotal,
    })
    return response.data
  },

  async applyCoupon(code: string): Promise<{
    discount: number
    message: string
  }> {
    const response = await apiClient.post('/coupons/apply', { code })
    return response.data
  },

  // Payment
  async initiatePayment(orderId: string): Promise<{
    razorpayOrderId: string
    amount: number
    currency: string
    key: string
  }> {
    const response = await apiClient.post(`/orders/${orderId}/payment/initiate`)
    return response.data
  },

  async verifyPayment(data: {
    orderId: string
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
  }): Promise<{ success: boolean; order: Order }> {
    const response = await apiClient.post('/orders/payment/verify', data)
    return response.data
  },

  // Prescription Upload
  async uploadPrescription(orderId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('prescription', file)
    const response = await apiClient.post(
      `/orders/${orderId}/prescription`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    return response.data
  },
}
