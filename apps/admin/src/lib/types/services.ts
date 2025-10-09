/**
 * Lab Tests & Services Management Types
 * Types for lab tests, test packages, homecare services, and doctors
 */

// ============ Lab Test Types ============

export interface LabTest {
  id: string
  name: string
  code: string
  category: string
  categoryId: string
  description: string
  prerequisites?: string
  sampleType: SampleType
  reportDeliveryTime: number // in hours
  price: number
  discountedPrice: number
  discount: number
  isPackage: boolean
  packageTests?: string[] // Test IDs included in package
  homeCollectionAvailable: boolean
  homeCollectionCharges: number
  fastingRequired: boolean
  status: TestStatus
  popularity: number
  views: number
  orders: number
  rating: number
  reviewCount: number
  image?: string
  createdAt: string
  updatedAt: string
}

export enum SampleType {
  BLOOD = 'BLOOD',
  URINE = 'URINE',
  STOOL = 'STOOL',
  SALIVA = 'SALIVA',
  SWAB = 'SWAB',
  TISSUE = 'TISSUE',
  OTHER = 'OTHER',
}

export enum TestStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export interface CreateLabTestRequest {
  name: string
  code: string
  categoryId: string
  description: string
  prerequisites?: string
  sampleType: SampleType
  reportDeliveryTime: number
  price: number
  discountedPrice: number
  isPackage: boolean
  packageTests?: string[]
  homeCollectionAvailable: boolean
  homeCollectionCharges: number
  fastingRequired: boolean
  status: TestStatus
  image?: string
}

export interface UpdateLabTestRequest extends Partial<CreateLabTestRequest> {}

export interface LabTestFilters {
  search?: string
  categoryId?: string
  status?: TestStatus
  sampleType?: SampleType
  isPackage?: boolean
  homeCollectionAvailable?: boolean
  minPrice?: number
  maxPrice?: number
}

export interface LabTestCategory {
  id: string
  name: string
  description?: string
  icon?: string
  testCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============ Homecare Service Types ============

export interface HomecareService {
  id: string
  name: string
  category: string
  categoryId: string
  description: string
  serviceType: ServiceType
  duration: number // in minutes
  pricingTiers: PricingTier[]
  providers: ServiceProvider[]
  availability: ServiceAvailability
  features: string[]
  requirements?: string[]
  status: ServiceStatus
  popularity: number
  views: number
  bookings: number
  rating: number
  reviewCount: number
  image?: string
  createdAt: string
  updatedAt: string
}

export enum ServiceType {
  NURSING = 'NURSING',
  PHYSIOTHERAPY = 'PHYSIOTHERAPY',
  ELDERLY_CARE = 'ELDERLY_CARE',
  BABY_CARE = 'BABY_CARE',
  MEDICAL_EQUIPMENT = 'MEDICAL_EQUIPMENT',
  ATTENDANT = 'ATTENDANT',
  DOCTOR_VISIT = 'DOCTOR_VISIT',
  OTHER = 'OTHER',
}

export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface PricingTier {
  id: string
  name: string
  duration: string // e.g., "8 hours", "12 hours", "24 hours"
  durationInHours: number
  price: number
  discountedPrice: number
}

export interface ServiceProvider {
  id: string
  name: string
  qualification: string
  experience: number
  rating: number
  isAvailable: boolean
}

export interface ServiceAvailability {
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
  sunday: TimeSlot[]
  is24x7: boolean
}

export interface TimeSlot {
  start: string // HH:mm format
  end: string // HH:mm format
}

export interface CreateHomecareServiceRequest {
  name: string
  categoryId: string
  description: string
  serviceType: ServiceType
  duration: number
  pricingTiers: Omit<PricingTier, 'id'>[]
  features: string[]
  requirements?: string[]
  status: ServiceStatus
  image?: string
  availability: ServiceAvailability
}

export interface UpdateHomecareServiceRequest extends Partial<CreateHomecareServiceRequest> {}

export interface HomecareServiceFilters {
  search?: string
  categoryId?: string
  serviceType?: ServiceType
  status?: ServiceStatus
  minPrice?: number
  maxPrice?: number
  is24x7?: boolean
}

export interface ServiceCategory {
  id: string
  name: string
  description?: string
  icon?: string
  serviceCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============ Doctor Types ============

export interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  qualification: string
  specializations: Specialization[]
  experience: number
  registrationNumber: string
  clinicHospital: ClinicHospital
  consultationFee: number
  followupFee: number
  schedule: DoctorSchedule
  availability: DoctorAvailability
  commission: Commission
  languages: string[]
  about?: string
  profileImage?: string
  status: DoctorStatus
  rating: number
  reviewCount: number
  totalConsultations: number
  createdAt: string
  updatedAt: string
}

export enum DoctorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
}

export interface Specialization {
  id: string
  name: string
  category: string
}

export interface ClinicHospital {
  id: string
  name: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  type: 'CLINIC' | 'HOSPITAL' | 'BOTH'
}

export interface DoctorSchedule {
  monday: ConsultationSlot[]
  tuesday: ConsultationSlot[]
  wednesday: ConsultationSlot[]
  thursday: ConsultationSlot[]
  friday: ConsultationSlot[]
  saturday: ConsultationSlot[]
  sunday: ConsultationSlot[]
}

export interface ConsultationSlot {
  start: string // HH:mm format
  end: string // HH:mm format
  slotDuration: number // in minutes
  maxPatients: number
  consultationType: 'IN_PERSON' | 'VIDEO' | 'BOTH'
}

export interface DoctorAvailability {
  isAvailableToday: boolean
  nextAvailableDate: string
  nextAvailableSlot: string
}

export interface Commission {
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minAmount?: number
  maxAmount?: number
}

export interface CreateDoctorRequest {
  name: string
  email: string
  phone: string
  qualification: string
  specializationIds: string[]
  experience: number
  registrationNumber: string
  clinicHospitalId: string
  consultationFee: number
  followupFee: number
  schedule: DoctorSchedule
  commission: Commission
  languages: string[]
  about?: string
  profileImage?: string
  status: DoctorStatus
}

export interface UpdateDoctorRequest extends Partial<CreateDoctorRequest> {}

export interface DoctorFilters {
  search?: string
  specializationId?: string
  status?: DoctorStatus
  minFee?: number
  maxFee?: number
  availableToday?: boolean
  city?: string
}

// ============ Common Types ============

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface LabTestListResponse extends PaginatedResponse<LabTest> {}
export interface HomecareServiceListResponse extends PaginatedResponse<HomecareService> {}
export interface DoctorListResponse extends PaginatedResponse<Doctor> {}

export interface BulkAction {
  ids: string[]
  action: 'ACTIVATE' | 'DEACTIVATE' | 'DELETE'
}

export interface ExportRequest {
  format: 'CSV' | 'EXCEL'
  filters?: Record<string, any>
}

export interface ExportResponse {
  url: string
  filename: string
  expiresAt: string
}

// ============ Statistics Types ============

export interface LabTestStats {
  totalTests: number
  activeTests: number
  packagesCount: number
  totalBookings: number
  totalRevenue: number
  averagePrice: number
}

export interface HomecareServiceStats {
  totalServices: number
  activeServices: number
  totalProviders: number
  totalBookings: number
  totalRevenue: number
  averagePrice: number
}

export interface DoctorStats {
  totalDoctors: number
  activeDoctors: number
  specializationCount: number
  totalConsultations: number
  totalRevenue: number
  averageFee: number
}
