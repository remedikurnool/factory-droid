// Doctor Types and Interfaces for Doctor Consultation Module

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  specialization: string;
  qualifications: string[];
  experience: number; // in years
  languages: string[];
  consultationFee: number;
  rating: number;
  totalConsultations: number;
  availability: DoctorAvailability[];
  clinicName?: string;
  clinicAddress?: string;
  about: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string;
  slotDuration: number; // in minutes
  isAvailable: boolean;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
}

export interface Consultation {
  id: string;
  consultationNumber: string;
  doctorId: string;
  doctor: Doctor;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  patientPhone: string;
  consultationDate: string;
  consultationTime: string;
  consultationType: 'video' | 'audio' | 'chat' | 'in-person';
  status: ConsultationStatus;
  symptoms: string;
  medicalHistory?: string;
  prescriptionId?: string;
  prescription?: Prescription;
  videoCallUrl?: string;
  meetingId?: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ConsultationStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface Prescription {
  id: string;
  consultationId: string;
  doctorId: string;
  patientId: string;
  diagnosis: string;
  medications: PrescribedMedication[];
  labTests?: string[];
  advice: string;
  followUpDate?: string;
  issuedAt: string;
}

export interface PrescribedMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ConsultationBooking {
  doctorId: string;
  consultationDate: string;
  consultationTime: string;
  consultationType: 'video' | 'audio' | 'chat' | 'in-person';
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  patientPhone: string;
  symptoms: string;
  medicalHistory?: string;
}

export interface DoctorFilters {
  specialization?: string;
  minFee?: number;
  maxFee?: number;
  minRating?: number;
  experience?: number;
  language?: string;
  availability?: 'today' | 'tomorrow' | 'this-week';
  search?: string;
}

export interface DoctorSearchParams extends DoctorFilters {
  page?: number;
  limit?: number;
  sortBy?: 'fee' | 'rating' | 'experience';
  sortOrder?: 'asc' | 'desc';
}

export interface DoctorListResponse {
  doctors: Doctor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SpecializationOption {
  value: string;
  label: string;
  count: number;
}

export const SPECIALIZATIONS: SpecializationOption[] = [
  { value: 'general-physician', label: 'General Physician', count: 0 },
  { value: 'cardiologist', label: 'Cardiologist', count: 0 },
  { value: 'dermatologist', label: 'Dermatologist', count: 0 },
  { value: 'pediatrician', label: 'Pediatrician', count: 0 },
  { value: 'gynecologist', label: 'Gynecologist', count: 0 },
  { value: 'orthopedic', label: 'Orthopedic', count: 0 },
  { value: 'neurologist', label: 'Neurologist', count: 0 },
  { value: 'psychiatrist', label: 'Psychiatrist', count: 0 },
  { value: 'dentist', label: 'Dentist', count: 0 },
  { value: 'ophthalmologist', label: 'Ophthalmologist', count: 0 },
  { value: 'ent-specialist', label: 'ENT Specialist', count: 0 },
  { value: 'gastroenterologist', label: 'Gastroenterologist', count: 0 },
  { value: 'urologist', label: 'Urologist', count: 0 },
  { value: 'endocrinologist', label: 'Endocrinologist', count: 0 },
  { value: 'pulmonologist', label: 'Pulmonologist', count: 0 },
];

export const CONSULTATION_TYPES = [
  { value: 'video', label: 'Video Call', icon: '📹' },
  { value: 'audio', label: 'Audio Call', icon: '📞' },
  { value: 'chat', label: 'Chat', icon: '💬' },
  { value: 'in-person', label: 'In-Person', icon: '🏥' },
] as const;

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
