/**
 * User Profile & Settings Types
 * Types for user management, profile, wallet, loyalty, and settings
 */

// User Profile
export interface UserProfile {
  id: string
  email: string
  phoneNumber: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  profilePicture?: string
  
  // Verification Status
  emailVerified: boolean
  phoneVerified: boolean
  
  // Loyalty & Wallet
  loyaltyPoints: number
  walletBalance: number
  
  // Preferences
  languagePreference: 'ENGLISH' | 'TELUGU' | 'HINDI'
  
  // Address
  defaultAddressId?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  languagePreference?: 'ENGLISH' | 'TELUGU' | 'HINDI'
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UploadProfilePictureResponse {
  url: string
  message: string
}

// Address Management
export interface Address {
  id: string
  userId: string
  type: 'HOME' | 'WORK' | 'OTHER'
  label?: string
  addressLine1: string
  addressLine2?: string
  landmark?: string
  city: string
  state: string
  pincode: string
  country: string
  phoneNumber?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAddressRequest {
  type: 'HOME' | 'WORK' | 'OTHER'
  label?: string
  addressLine1: string
  addressLine2?: string
  landmark?: string
  city: string
  state: string
  pincode: string
  country: string
  phoneNumber?: string
  isDefault?: boolean
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

// Prescriptions
export interface Prescription {
  id: string
  userId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  expiresAt?: string
  notes?: string
  linkedOrders: string[] // Order IDs
  doctorName?: string
  hospitalName?: string
  prescriptionDate?: string
}

export interface UploadPrescriptionRequest {
  file: File
  notes?: string
  doctorName?: string
  hospitalName?: string
  prescriptionDate?: string
}

export interface UploadPrescriptionResponse {
  prescription: Prescription
  message: string
}

// Wallet
export interface WalletTransaction {
  id: string
  userId: string
  type: 'CREDIT' | 'DEBIT'
  amount: number
  balance: number
  description: string
  referenceType?: 'ORDER' | 'REFUND' | 'RECHARGE' | 'CASHBACK' | 'REFERRAL'
  referenceId?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED'
  createdAt: string
  updatedAt: string
}

export interface RechargeWalletRequest {
  amount: number
  paymentMethod: string
}

export interface RechargeWalletResponse {
  transactionId: string
  amount: number
  paymentOrderId: string
  message: string
}

// Loyalty Points
export interface LoyaltyTransaction {
  id: string
  userId: string
  type: 'EARNED' | 'REDEEMED' | 'EXPIRED'
  points: number
  balance: number
  description: string
  referenceType?: 'ORDER' | 'REFERRAL' | 'REVIEW' | 'SIGNUP_BONUS'
  referenceId?: string
  expiresAt?: string
  createdAt: string
}

export interface RedeemPointsRequest {
  points: number
  orderId?: string
}

export interface RedeemPointsResponse {
  pointsRedeemed: number
  amountCredited: number
  newBalance: number
  message: string
}

// Referral Program
export interface ReferralDetails {
  referralCode: string
  referralLink: string
  totalReferrals: number
  successfulReferrals: number
  pendingReferrals: number
  totalPointsEarned: number
  referralBonus: number
}

export interface Referral {
  id: string
  referrerId: string
  referredUserId?: string
  referredEmail?: string
  referredPhone?: string
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED'
  pointsEarned: number
  createdAt: string
  completedAt?: string
}

// Notifications
export interface Notification {
  id: string
  userId: string
  type: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'PROMOTION' | 'SYSTEM' | 'PRESCRIPTION' | 'INSURANCE'
  title: string
  message: string
  imageUrl?: string
  actionUrl?: string
  isRead: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: string
  readAt?: string
}

export interface NotificationPreferences {
  userId: string
  email: {
    enabled: boolean
    orderUpdates: boolean
    promotions: boolean
    newsletter: boolean
  }
  sms: {
    enabled: boolean
    orderUpdates: boolean
    promotions: boolean
    otp: boolean
  }
  push: {
    enabled: boolean
    orderUpdates: boolean
    promotions: boolean
    reminders: boolean
  }
  whatsapp: {
    enabled: boolean
    orderUpdates: boolean
    promotions: boolean
  }
  updatedAt: string
}

export interface UpdateNotificationPreferencesRequest {
  email?: {
    enabled?: boolean
    orderUpdates?: boolean
    promotions?: boolean
    newsletter?: boolean
  }
  sms?: {
    enabled?: boolean
    orderUpdates?: boolean
    promotions?: boolean
    otp?: boolean
  }
  push?: {
    enabled?: boolean
    orderUpdates?: boolean
    promotions?: boolean
    reminders?: boolean
  }
  whatsapp?: {
    enabled?: boolean
    orderUpdates?: boolean
    promotions?: boolean
  }
}

// Family Members
export interface FamilyMember {
  id: string
  userId: string
  name: string
  relationship: 'SPOUSE' | 'SON' | 'DAUGHTER' | 'FATHER' | 'MOTHER' | 'BROTHER' | 'SISTER' | 'OTHER'
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  phoneNumber?: string
  profilePicture?: string
  medicalConditions?: string[]
  allergies?: string[]
  bloodGroup?: string
  createdAt: string
  updatedAt: string
}

export interface CreateFamilyMemberRequest {
  name: string
  relationship: string
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  phoneNumber?: string
  medicalConditions?: string[]
  allergies?: string[]
  bloodGroup?: string
}

export interface UpdateFamilyMemberRequest extends Partial<CreateFamilyMemberRequest> {}

// Payment Methods
export interface PaymentMethod {
  id: string
  userId: string
  type: 'CARD' | 'UPI' | 'NETBANKING' | 'WALLET'
  
  // For Cards
  cardNumber?: string // Last 4 digits
  cardHolderName?: string
  cardType?: 'VISA' | 'MASTERCARD' | 'RUPAY' | 'AMEX'
  expiryMonth?: string
  expiryYear?: string
  
  // For UPI
  upiId?: string
  
  // For Net Banking
  bankName?: string
  accountNumber?: string // Last 4 digits
  
  // For Wallet
  walletProvider?: 'PAYTM' | 'PHONEPE' | 'GPAY' | 'MOBIKWIK'
  
  isDefault: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AddPaymentMethodRequest {
  type: 'CARD' | 'UPI' | 'NETBANKING' | 'WALLET'
  
  // Card details
  cardNumber?: string
  cardHolderName?: string
  cardType?: string
  expiryMonth?: string
  expiryYear?: string
  cvv?: string
  
  // UPI details
  upiId?: string
  
  // Net Banking details
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  
  // Wallet details
  walletProvider?: string
  
  isDefault?: boolean
}

// Health Calculators
export interface BMICalculation {
  height: number // in cm
  weight: number // in kg
  bmi: number
  category: 'UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE'
  idealWeightRange: {
    min: number
    max: number
  }
  recommendations: string[]
}

export interface WHRCalculation {
  waist: number // in cm
  hip: number // in cm
  whr: number
  category: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK'
  gender: 'MALE' | 'FEMALE'
  recommendations: string[]
}

// Settings
export interface PrivacySettings {
  userId: string
  profileVisibility: 'PUBLIC' | 'PRIVATE'
  showEmail: boolean
  showPhone: boolean
  showAddress: boolean
  allowMarketingEmails: boolean
  allowMarketingSMS: boolean
  allowDataSharing: boolean
  updatedAt: string
}

export interface UpdatePrivacySettingsRequest {
  profileVisibility?: 'PUBLIC' | 'PRIVATE'
  showEmail?: boolean
  showPhone?: boolean
  showAddress?: boolean
  allowMarketingEmails?: boolean
  allowMarketingSMS?: boolean
  allowDataSharing?: boolean
}

export interface DeleteAccountRequest {
  password: string
  reason?: string
  feedback?: string
}

export interface DeleteAccountResponse {
  success: boolean
  message: string
  scheduledDeletionDate: string
}

// Verification
export interface SendVerificationRequest {
  type: 'EMAIL' | 'PHONE'
}

export interface VerifyRequest {
  type: 'EMAIL' | 'PHONE'
  otp: string
}

export interface VerifyResponse {
  success: boolean
  message: string
  verified: boolean
}
