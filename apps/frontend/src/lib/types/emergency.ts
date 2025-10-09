/**
 * Emergency Services Types
 * Types for ambulance booking and blood bank services
 */

export type AmbulanceType = 'BASIC' | 'ADVANCED' | 'ICU'

export type AmbulanceStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'EN_ROUTE_PICKUP'
  | 'PATIENT_PICKED'
  | 'EN_ROUTE_DROP'
  | 'COMPLETED'
  | 'CANCELLED'

export type PatientCondition =
  | 'CRITICAL'
  | 'SERIOUS'
  | 'MODERATE'
  | 'STABLE'
  | 'UNKNOWN'

export type BloodGroup =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE'

export interface Location {
  latitude: number
  longitude: number
  address: string
  landmark?: string
  pincode: string
}

export interface AmbulanceBooking {
  id: string
  bookingNumber: string
  
  // Ambulance details
  ambulanceType: AmbulanceType
  
  // Locations
  pickupLocation: Location
  dropLocation: Location
  
  // Patient information
  patientName: string
  patientAge: number
  patientGender: 'MALE' | 'FEMALE' | 'OTHER'
  patientCondition: PatientCondition
  medicalNotes?: string
  
  // Emergency contact
  emergencyContactName: string
  emergencyContactNumber: string
  
  // Status and tracking
  status: AmbulanceStatus
  estimatedArrivalTime?: string
  actualPickupTime?: string
  actualDropTime?: string
  
  // Driver and vehicle
  driver?: {
    id: string
    name: string
    phoneNumber: string
    vehicleNumber: string
  }
  
  // Pricing
  estimatedCost: number
  actualCost?: number
  
  // Metadata
  createdAt: string
  updatedAt: string
  completedAt?: string
  cancellationReason?: string
}

export interface AmbulanceBookingRequest {
  ambulanceType: AmbulanceType
  pickupLocation: Location
  dropLocation: Location
  patientName: string
  patientAge: number
  patientGender: 'MALE' | 'FEMALE' | 'OTHER'
  patientCondition: PatientCondition
  medicalNotes?: string
  emergencyContactName: string
  emergencyContactNumber: string
}

export interface BloodBankService {
  bloodGroup: BloodGroup
  available: boolean
  unitsAvailable?: number
  lastUpdated: string
}

export interface BloodBank {
  id: string
  name: string
  type: 'GOVERNMENT' | 'PRIVATE' | 'NGO' | 'HOSPITAL_BASED'
  
  // Contact information
  phoneNumber: string
  emergencyNumber?: string
  email?: string
  website?: string
  
  // Location
  location: Location
  
  // Services
  services: BloodBankService[]
  
  // Facilities
  facilities: string[]
  
  // Operating hours
  operatingHours: {
    [key: string]: {
      open: string
      close: string
      is24x7?: boolean
    }
  }
  
  // Additional info
  bloodComponentsAvailable: string[]
  donationAccepted: boolean
  crossMatchingAvailable: boolean
  
  // Ratings
  rating?: number
  totalReviews?: number
  
  // Verification
  verified: boolean
  licenseNumber?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface BloodBankSearchParams {
  bloodGroup?: BloodGroup
  location?: {
    latitude: number
    longitude: number
    radius?: number // in km
  }
  type?: 'GOVERNMENT' | 'PRIVATE' | 'NGO' | 'HOSPITAL_BASED'
  available?: boolean
  page?: number
  limit?: number
}

export interface EmergencyContact {
  id: string
  name: string
  number: string
  category: 'AMBULANCE' | 'POLICE' | 'FIRE' | 'HOSPITAL' | 'BLOOD_BANK' | 'OTHER'
  description?: string
  location?: string
  available24x7: boolean
}

export interface AmbulanceCostEstimate {
  ambulanceType: AmbulanceType
  distance: number // in km
  baseFare: number
  perKmCharge: number
  estimatedCost: number
  estimatedTime: number // in minutes
}

export interface TrackingUpdate {
  status: AmbulanceStatus
  message: string
  timestamp: string
  location?: {
    latitude: number
    longitude: number
  }
}
