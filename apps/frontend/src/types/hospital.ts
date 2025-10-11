// Hospital Types and Interfaces

export interface Hospital {
  id: string;
  name: string;
  description: string;
  type: HospitalType;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website?: string;
  image?: string;
  images?: string[];
  rating: number;
  totalReviews: number;
  established: number;
  bedCount: number;
  departments: Department[];
  facilities: Facility[];
  accreditations: string[];
  emergencyAvailable: boolean;
  ambulanceAvailable: boolean;
  pharmacyAvailable: boolean;
  labAvailable: boolean;
  insuranceAccepted: string[];
  visitingHours: VisitingHours;
  latitude?: number;
  longitude?: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type HospitalType =
  | 'multi-specialty'
  | 'specialty'
  | 'general'
  | 'super-specialty'
  | 'clinic'
  | 'nursing-home';

export interface Department {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  doctors?: number;
}

export interface Facility {
  id: string;
  name: string;
  icon?: string;
  available: boolean;
}

export interface VisitingHours {
  general: string;
  emergency: string;
  icu: string;
}

export interface HospitalFilters {
  type?: HospitalType;
  department?: string;
  city?: string;
  emergencyAvailable?: boolean;
  minRating?: number;
  search?: string;
}

export interface HospitalSearchParams extends HospitalFilters {
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'name' | 'bedCount';
  sortOrder?: 'asc' | 'desc';
}

export interface HospitalListResponse {
  hospitals: Hospital[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const HOSPITAL_TYPES = [
  { value: 'multi-specialty', label: 'Multi-Specialty Hospital' },
  { value: 'super-specialty', label: 'Super-Specialty Hospital' },
  { value: 'specialty', label: 'Specialty Hospital' },
  { value: 'general', label: 'General Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'nursing-home', label: 'Nursing Home' },
] as const;

export const COMMON_DEPARTMENTS = [
  { value: 'cardiology', label: 'Cardiology', icon: '❤️' },
  { value: 'neurology', label: 'Neurology', icon: '🧠' },
  { value: 'orthopedics', label: 'Orthopedics', icon: '🦴' },
  { value: 'pediatrics', label: 'Pediatrics', icon: '👶' },
  { value: 'gynecology', label: 'Gynecology', icon: '👩' },
  { value: 'general-surgery', label: 'General Surgery', icon: '🏥' },
  { value: 'emergency', label: 'Emergency', icon: '🚨' },
  { value: 'icu', label: 'ICU', icon: '🏥' },
  { value: 'radiology', label: 'Radiology', icon: '📷' },
  { value: 'pathology', label: 'Pathology', icon: '🔬' },
];

export const COMMON_FACILITIES = [
  { value: 'icu', label: 'ICU' },
  { value: 'emergency', label: '24/7 Emergency' },
  { value: 'pharmacy', label: 'In-house Pharmacy' },
  { value: 'lab', label: 'Diagnostic Lab' },
  { value: 'blood-bank', label: 'Blood Bank' },
  { value: 'ambulance', label: 'Ambulance Service' },
  { value: 'parking', label: 'Parking' },
  { value: 'cafeteria', label: 'Cafeteria' },
  { value: 'atm', label: 'ATM' },
  { value: 'wifi', label: 'Free WiFi' },
];
