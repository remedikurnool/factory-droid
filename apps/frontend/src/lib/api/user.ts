/**
 * User Profile & Settings API Client
 * API methods for user management, profile, wallet, loyalty, and settings
 */

import { apiClient } from './client'
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UploadProfilePictureResponse,
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  Prescription,
  UploadPrescriptionResponse,
  WalletTransaction,
  RechargeWalletRequest,
  RechargeWalletResponse,
  LoyaltyTransaction,
  RedeemPointsRequest,
  RedeemPointsResponse,
  ReferralDetails,
  Referral,
  Notification,
  NotificationPreferences,
  UpdateNotificationPreferencesRequest,
  FamilyMember,
  CreateFamilyMemberRequest,
  UpdateFamilyMemberRequest,
  PaymentMethod,
  AddPaymentMethodRequest,
  BMICalculation,
  WHRCalculation,
  PrivacySettings,
  UpdatePrivacySettingsRequest,
  DeleteAccountRequest,
  DeleteAccountResponse,
  SendVerificationRequest,
  VerifyRequest,
  VerifyResponse,
} from '@/lib/types/user'

export const userAPI = {
  // ============ Profile ============

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get('/user/profile')
    return response.data
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiClient.put('/user/profile', data)
    return response.data
  },

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<UploadProfilePictureResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/user/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.post('/user/profile/change-password', data)
    return response.data
  },

  /**
   * Send verification code (email or phone)
   */
  async sendVerification(data: SendVerificationRequest): Promise<{ message: string }> {
    const response = await apiClient.post('/user/profile/send-verification', data)
    return response.data
  },

  /**
   * Verify email or phone
   */
  async verify(data: VerifyRequest): Promise<VerifyResponse> {
    const response = await apiClient.post('/user/profile/verify', data)
    return response.data
  },

  // ============ Addresses ============

  /**
   * Get all user addresses
   */
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get('/user/addresses')
    return response.data
  },

  /**
   * Get address by ID
   */
  async getAddressById(addressId: string): Promise<Address> {
    const response = await apiClient.get(`/user/addresses/${addressId}`)
    return response.data
  },

  /**
   * Create new address
   */
  async createAddress(data: CreateAddressRequest): Promise<Address> {
    const response = await apiClient.post('/user/addresses', data)
    return response.data
  },

  /**
   * Update address
   */
  async updateAddress(addressId: string, data: UpdateAddressRequest): Promise<Address> {
    const response = await apiClient.put(`/user/addresses/${addressId}`, data)
    return response.data
  },

  /**
   * Delete address
   */
  async deleteAddress(addressId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/user/addresses/${addressId}`)
    return response.data
  },

  /**
   * Set default address
   */
  async setDefaultAddress(addressId: string): Promise<Address> {
    const response = await apiClient.post(`/user/addresses/${addressId}/set-default`)
    return response.data
  },

  // ============ Prescriptions ============

  /**
   * Get all user prescriptions
   */
  async getPrescriptions(): Promise<Prescription[]> {
    const response = await apiClient.get('/user/prescriptions')
    return response.data
  },

  /**
   * Get prescription by ID
   */
  async getPrescriptionById(prescriptionId: string): Promise<Prescription> {
    const response = await apiClient.get(`/user/prescriptions/${prescriptionId}`)
    return response.data
  },

  /**
   * Upload new prescription
   */
  async uploadPrescription(
    file: File,
    notes?: string,
    doctorName?: string,
    hospitalName?: string,
    prescriptionDate?: string
  ): Promise<UploadPrescriptionResponse> {
    const formData = new FormData()
    formData.append('file', file)
    if (notes) formData.append('notes', notes)
    if (doctorName) formData.append('doctorName', doctorName)
    if (hospitalName) formData.append('hospitalName', hospitalName)
    if (prescriptionDate) formData.append('prescriptionDate', prescriptionDate)

    const response = await apiClient.post('/user/prescriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Delete prescription
   */
  async deletePrescription(prescriptionId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/user/prescriptions/${prescriptionId}`)
    return response.data
  },

  // ============ Wallet ============

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<{ balance: number }> {
    const response = await apiClient.get('/user/wallet/balance')
    return response.data
  },

  /**
   * Get wallet transactions
   */
  async getWalletTransactions(params?: {
    page?: number
    limit?: number
    type?: 'CREDIT' | 'DEBIT'
  }): Promise<{
    transactions: WalletTransaction[]
    total: number
    page: number
    limit: number
  }> {
    const response = await apiClient.get('/user/wallet/transactions', { params })
    return response.data
  },

  /**
   * Recharge wallet
   */
  async rechargeWallet(data: RechargeWalletRequest): Promise<RechargeWalletResponse> {
    const response = await apiClient.post('/user/wallet/recharge', data)
    return response.data
  },

  // ============ Loyalty Points ============

  /**
   * Get loyalty points balance
   */
  async getLoyaltyBalance(): Promise<{ points: number }> {
    const response = await apiClient.get('/user/loyalty/balance')
    return response.data
  },

  /**
   * Get loyalty transactions
   */
  async getLoyaltyTransactions(params?: {
    page?: number
    limit?: number
  }): Promise<{
    transactions: LoyaltyTransaction[]
    total: number
    page: number
    limit: number
  }> {
    const response = await apiClient.get('/user/loyalty/transactions', { params })
    return response.data
  },

  /**
   * Redeem loyalty points
   */
  async redeemPoints(data: RedeemPointsRequest): Promise<RedeemPointsResponse> {
    const response = await apiClient.post('/user/loyalty/redeem', data)
    return response.data
  },

  // ============ Referral Program ============

  /**
   * Get referral details
   */
  async getReferralDetails(): Promise<ReferralDetails> {
    const response = await apiClient.get('/user/referral/details')
    return response.data
  },

  /**
   * Get referral history
   */
  async getReferralHistory(): Promise<Referral[]> {
    const response = await apiClient.get('/user/referral/history')
    return response.data
  },

  /**
   * Send referral invite
   */
  async sendReferralInvite(data: {
    email?: string
    phone?: string
    name?: string
  }): Promise<{ message: string }> {
    const response = await apiClient.post('/user/referral/invite', data)
    return response.data
  },

  // ============ Notifications ============

  /**
   * Get all notifications
   */
  async getNotifications(params?: {
    page?: number
    limit?: number
    unreadOnly?: boolean
  }): Promise<{
    notifications: Notification[]
    total: number
    unreadCount: number
    page: number
    limit: number
  }> {
    const response = await apiClient.get('/user/notifications', { params })
    return response.data
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.post(`/user/notifications/${notificationId}/read`)
    return response.data
  },

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    const response = await apiClient.post('/user/notifications/read-all')
    return response.data
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/user/notifications/${notificationId}`)
    return response.data
  },

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get('/user/notifications/preferences')
    return response.data
  },

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    data: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferences> {
    const response = await apiClient.put('/user/notifications/preferences', data)
    return response.data
  },

  // ============ Family Members ============

  /**
   * Get all family members
   */
  async getFamilyMembers(): Promise<FamilyMember[]> {
    const response = await apiClient.get('/user/family-members')
    return response.data
  },

  /**
   * Get family member by ID
   */
  async getFamilyMemberById(memberId: string): Promise<FamilyMember> {
    const response = await apiClient.get(`/user/family-members/${memberId}`)
    return response.data
  },

  /**
   * Add family member
   */
  async addFamilyMember(data: CreateFamilyMemberRequest): Promise<FamilyMember> {
    const response = await apiClient.post('/user/family-members', data)
    return response.data
  },

  /**
   * Update family member
   */
  async updateFamilyMember(
    memberId: string,
    data: UpdateFamilyMemberRequest
  ): Promise<FamilyMember> {
    const response = await apiClient.put(`/user/family-members/${memberId}`, data)
    return response.data
  },

  /**
   * Delete family member
   */
  async deleteFamilyMember(memberId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/user/family-members/${memberId}`)
    return response.data
  },

  // ============ Payment Methods ============

  /**
   * Get all payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get('/user/payment-methods')
    return response.data
  },

  /**
   * Add payment method
   */
  async addPaymentMethod(data: AddPaymentMethodRequest): Promise<PaymentMethod> {
    const response = await apiClient.post('/user/payment-methods', data)
    return response.data
  },

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/user/payment-methods/${paymentMethodId}`)
    return response.data
  },

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    const response = await apiClient.post(`/user/payment-methods/${paymentMethodId}/set-default`)
    return response.data
  },

  // ============ Health Calculators ============

  /**
   * Calculate BMI
   */
  async calculateBMI(height: number, weight: number): Promise<BMICalculation> {
    const response = await apiClient.post('/user/health/calculate-bmi', { height, weight })
    return response.data
  },

  /**
   * Calculate WHR (Waist-to-Hip Ratio)
   */
  async calculateWHR(
    waist: number,
    hip: number,
    gender: 'MALE' | 'FEMALE'
  ): Promise<WHRCalculation> {
    const response = await apiClient.post('/user/health/calculate-whr', { waist, hip, gender })
    return response.data
  },

  // ============ Privacy Settings ============

  /**
   * Get privacy settings
   */
  async getPrivacySettings(): Promise<PrivacySettings> {
    const response = await apiClient.get('/user/privacy-settings')
    return response.data
  },

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(data: UpdatePrivacySettingsRequest): Promise<PrivacySettings> {
    const response = await apiClient.put('/user/privacy-settings', data)
    return response.data
  },

  // ============ Account Management ============

  /**
   * Delete account
   */
  async deleteAccount(data: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    const response = await apiClient.post('/user/account/delete', data)
    return response.data
  },

  /**
   * Export user data
   */
  async exportUserData(): Promise<Blob> {
    const response = await apiClient.get('/user/account/export-data', {
      responseType: 'blob',
    })
    return response.data
  },
}
