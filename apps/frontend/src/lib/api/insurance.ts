/**
 * Insurance API Client
 * API methods for insurance plans, quotes, and purchase
 */

import { apiClient } from './client'
import type {
  InsurancePlan,
  InsurancePlanSearchParams,
  InsurancePlanSearchResponse,
  InsuranceQuoteRequest,
  InsuranceQuote,
  InsurancePurchaseRequest,
  InsurancePurchaseResponse,
  InsurancePolicy,
  PlanComparison,
} from '@/lib/types/insurance'

export const insuranceAPI = {
  // ============ Plans ============

  /**
   * Search insurance plans with filters
   */
  async searchPlans(params: InsurancePlanSearchParams): Promise<InsurancePlanSearchResponse> {
    const response = await apiClient.get('/insurance/plans', { params })
    return response.data
  },

  /**
   * Get insurance plan by ID
   */
  async getPlanById(planId: string): Promise<InsurancePlan> {
    const response = await apiClient.get(`/insurance/plans/${planId}`)
    return response.data
  },

  /**
   * Get popular insurance plans
   */
  async getPopularPlans(limit: number = 10): Promise<InsurancePlan[]> {
    const response = await apiClient.get('/insurance/plans/popular', { params: { limit } })
    return response.data
  },

  /**
   * Get recommended plans based on user profile
   */
  async getRecommendedPlans(userId: string): Promise<InsurancePlan[]> {
    const response = await apiClient.get(`/insurance/plans/recommended/${userId}`)
    return response.data
  },

  // ============ Comparison ============

  /**
   * Compare multiple insurance plans
   */
  async comparePlans(planIds: string[]): Promise<PlanComparison> {
    const response = await apiClient.post('/insurance/plans/compare', { planIds })
    return response.data
  },

  // ============ Quotes ============

  /**
   * Get insurance quote
   */
  async getQuote(request: InsuranceQuoteRequest): Promise<InsuranceQuote> {
    const response = await apiClient.post('/insurance/quotes', request)
    return response.data
  },

  /**
   * Get quote by ID
   */
  async getQuoteById(quoteId: string): Promise<InsuranceQuote> {
    const response = await apiClient.get(`/insurance/quotes/${quoteId}`)
    return response.data
  },

  /**
   * Get all quotes for a user
   */
  async getUserQuotes(userId: string): Promise<InsuranceQuote[]> {
    const response = await apiClient.get(`/insurance/quotes/user/${userId}`)
    return response.data
  },

  // ============ Purchase ============

  /**
   * Purchase insurance policy
   */
  async purchasePolicy(request: InsurancePurchaseRequest): Promise<InsurancePurchaseResponse> {
    const response = await apiClient.post('/insurance/purchase', request)
    return response.data
  },

  /**
   * Verify payment for insurance purchase
   */
  async verifyPayment(
    quoteId: string,
    paymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<InsurancePurchaseResponse> {
    const response = await apiClient.post('/insurance/purchase/verify-payment', {
      quoteId,
      paymentId,
      razorpayOrderId,
      razorpaySignature,
    })
    return response.data
  },

  // ============ Policies ============

  /**
   * Get all policies for a user
   */
  async getUserPolicies(userId: string): Promise<InsurancePolicy[]> {
    const response = await apiClient.get(`/insurance/policies/user/${userId}`)
    return response.data
  },

  /**
   * Get policy by ID
   */
  async getPolicyById(policyId: string): Promise<InsurancePolicy> {
    const response = await apiClient.get(`/insurance/policies/${policyId}`)
    return response.data
  },

  /**
   * Get policy by policy number
   */
  async getPolicyByNumber(policyNumber: string): Promise<InsurancePolicy> {
    const response = await apiClient.get(`/insurance/policies/number/${policyNumber}`)
    return response.data
  },

  /**
   * Download policy document
   */
  async downloadPolicyDocument(policyId: string): Promise<Blob> {
    const response = await apiClient.get(`/insurance/policies/${policyId}/document`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Renew policy
   */
  async renewPolicy(policyId: string): Promise<InsuranceQuote> {
    const response = await apiClient.post(`/insurance/policies/${policyId}/renew`)
    return response.data
  },

  // ============ Documents ============

  /**
   * Upload document for insurance purchase
   */
  async uploadDocument(file: File, documentType: string): Promise<{ url: string; id: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', documentType)

    const response = await apiClient.post('/insurance/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Delete uploaded document
   */
  async deleteDocument(documentId: string): Promise<void> {
    await apiClient.delete(`/insurance/documents/${documentId}`)
  },

  // ============ Insurance Companies ============

  /**
   * Get all insurance companies
   */
  async getInsuranceCompanies(): Promise<
    Array<{
      id: string
      name: string
      logo: string
      rating: number
      claimSettlementRatio: number
    }>
  > {
    const response = await apiClient.get('/insurance/companies')
    return response.data
  },

  /**
   * Get network hospitals for a plan
   */
  async getNetworkHospitals(
    planId: string,
    params?: { city?: string; state?: string; pincode?: string }
  ): Promise<
    Array<{
      id: string
      name: string
      address: string
      city: string
      state: string
      pincode: string
      phoneNumber: string
      type: string
      cashless: boolean
    }>
  > {
    const response = await apiClient.get(`/insurance/plans/${planId}/hospitals`, { params })
    return response.data
  },

  // ============ Claims ============

  /**
   * File insurance claim
   */
  async fileClaim(data: {
    policyId: string
    claimType: 'CASHLESS' | 'REIMBURSEMENT'
    hospitalName: string
    admissionDate: string
    dischargeDate?: string
    claimAmount: number
    diagnosis: string
    documents: string[]
    description: string
  }): Promise<{
    claimId: string
    claimNumber: string
    status: string
    message: string
  }> {
    const response = await apiClient.post('/insurance/claims', data)
    return response.data
  },

  /**
   * Get claims for a policy
   */
  async getPolicyClaims(policyId: string): Promise<
    Array<{
      id: string
      claimNumber: string
      claimType: string
      claimAmount: number
      approvedAmount?: number
      status: string
      filedDate: string
      settledDate?: string
    }>
  > {
    const response = await apiClient.get(`/insurance/policies/${policyId}/claims`)
    return response.data
  },

  /**
   * Track claim status
   */
  async trackClaim(claimId: string): Promise<{
    claimId: string
    claimNumber: string
    status: string
    timeline: Array<{
      status: string
      date: string
      description: string
    }>
  }> {
    const response = await apiClient.get(`/insurance/claims/${claimId}/track`)
    return response.data
  },
}
