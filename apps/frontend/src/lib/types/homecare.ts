/**
 * Homecare Services Types
 * Types for homecare services, bookings, and caretakers
 */

export type ServiceCategory =
  | 'NURSING'
  | 'PHYSIOTHERAPY'
  | 'DIABETES_CARE'
  | 'ELDERLY_CARE'
  | 'POST_SURGERY_CARE'
  | 'MEDICAL_EQUIPMENT'
  | 'LAB_SAMPLE_COLLECTION'

export type PricingType = 'SESSION' | 'HOURLY' | 'DAILY' | 'MONTHLY'

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'

export type ServiceDuration =
  | '1_HOUR'
  | '2_HOURS'
  | '4_HOURS'
  | '8_HOURS'
  | '1_DAY'
  | '7_DAYS'
  | '15_DAYS'
  | '30_DAYS'

export interface ServicePricing {
  id: string
  type: PricingType
  duration: ServiceDuration
  sessions?: number // For session-based pricing (1, 5, 10 sessions)
  price: number
  discountPrice?: number
  description: string
}

export interface HomecareService {
  id: string
  name: string
  category: ServiceCategory
  description: string
  shortDescription: string
  imageUrl?: string
  
  // What's included
  included: string[]
  
  // Pricing variants
  pricingOptions: ServicePricing[]
  
  // Requirements
  caretakerQualifications: string[]
  equipmentProvided?: string[]
  
  // Availability
  available: boolean
  availableFromTime?: string
  availableToTime?: string
  
  // Ratings
  rating?: number
  totalReviews?: number
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface PatientDetails {
  name: string
  age: number
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  contactNumber: string
  medicalCondition?: string
  specialRequirements?: string
}

export interface HomecareBooking {
  id: string
  bookingNumber: string
  
  // Service details
  service: HomecareService
  pricingOption: ServicePricing
  
  // Patient and address
  patientDetails: PatientDetails
  address: {
    id: string
    fullName: string
    phoneNumber: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    landmark?: string
  }
  
  // Schedule
  startDate: string
  startTime: string
  endDate?: string // For multi-day bookings
  
  // Special requirements
  specialRequirements?: string
  
  // Caretaker
  caretaker?: Caretaker
  caretakerRating?: number
  caretakerReview?: string
  
  // Status
  status: BookingStatus
  
  // Payment
  totalAmount: number
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentMethod?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
}

export interface Caretaker {
  id: string
  name: string
  profilePhoto?: string
  qualifications: string[]
  specializations: string[]
  experience: number // Years
  rating: number
  totalReviews: number
  verified: boolean
  languages: string[]
}

export interface BookingReview {
  id: string
  bookingId: string
  caretakerId: string
  rating: number
  review: string
  helpful: number
  notHelpful: number
  createdAt: string
}

export interface ServiceSearchParams {
  category?: ServiceCategory
  minPrice?: number
  maxPrice?: number
  available?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

export interface BookingSearchParams {
  status?: BookingStatus
  fromDate?: string
  toDate?: string
  serviceId?: string
  page?: number
  limit?: number
}

export interface ExtendBookingRequest {
  bookingId: string
  extensionDays: number
  newEndDate: string
}

export interface CancelBookingRequest {
  bookingId: string
  reason: string
}

export interface RateCaretakerRequest {
  bookingId: string
  caretakerId: string
  rating: number
  review: string
}

export interface RequestReplacementRequest {
  bookingId: string
  reason: string
}
