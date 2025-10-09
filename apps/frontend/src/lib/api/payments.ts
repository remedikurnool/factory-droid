/**
 * Payment API Client
 * Handles payment initiation, verification, and status checks
 */

import { apiClient } from './client'
import type {
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
} from '../payment/razorpay'

export const paymentAPI = {
  /**
   * Initiate a new payment
   * Creates a Razorpay order
   */
  initiatePayment: async (
    data: PaymentInitiateRequest
  ): Promise<PaymentInitiateResponse> => {
    const response = await apiClient.post('/payments/initiate', data)
    return response.data
  },

  /**
   * Verify payment after successful transaction
   * Validates signature and updates order status
   */
  verifyPayment: async (
    data: PaymentVerifyRequest
  ): Promise<PaymentVerifyResponse> => {
    const response = await apiClient.post('/payments/verify', data)
    return response.data
  },

  /**
   * Get payment status
   */
  getPaymentStatus: async (
    orderId: string
  ): Promise<{ status: string; paymentId?: string }> => {
    const response = await apiClient.get(`/payments/status/${orderId}`)
    return response.data
  },

  /**
   * Refund payment
   */
  refundPayment: async (
    orderId: string,
    amount?: number
  ): Promise<{ refundId: string; status: string }> => {
    const response = await apiClient.post(`/payments/refund/${orderId}`, {
      amount,
    })
    return response.data
  },

  /**
   * Get payment history for user
   */
  getPaymentHistory: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{
    payments: any[]
    total: number
    page: number
    limit: number
  }> => {
    const response = await apiClient.get('/payments', { params })
    return response.data
  },
}
