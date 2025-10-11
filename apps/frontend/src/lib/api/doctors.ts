// Doctor API Client

import { apiClient } from './client';
import type {
  Doctor,
  DoctorListResponse,
  DoctorSearchParams,
  Consultation,
  ConsultationBooking,
  TimeSlot,
  SpecializationOption,
} from '@/types/doctor';

/**
 * Get all doctors with filters and pagination
 */
export async function getDoctors(
  params?: DoctorSearchParams
): Promise<DoctorListResponse> {
  const response = await apiClient.get<DoctorListResponse>('/doctors', {
    params,
  });
  return response.data;
}

/**
 * Get doctor by ID
 */
export async function getDoctorById(id: string): Promise<Doctor> {
  const response = await apiClient.get<Doctor>(`/doctors/${id}`);
  return response.data;
}

/**
 * Search doctors
 */
export async function searchDoctors(query: string): Promise<Doctor[]> {
  const response = await apiClient.get<Doctor[]>('/doctors/search', {
    params: { q: query },
  });
  return response.data;
}

/**
 * Get doctor availability for a specific date
 */
export async function getDoctorAvailability(
  doctorId: string,
  date: string
): Promise<TimeSlot[]> {
  const response = await apiClient.get<TimeSlot[]>(
    `/doctors/${doctorId}/availability`,
    {
      params: { date },
    }
  );
  return response.data;
}

/**
 * Get all specializations with counts
 */
export async function getSpecializations(): Promise<SpecializationOption[]> {
  const response = await apiClient.get<SpecializationOption[]>(
    '/doctors/specializations'
  );
  return response.data;
}

/**
 * Book a consultation
 */
export async function bookConsultation(
  booking: ConsultationBooking
): Promise<Consultation> {
  const response = await apiClient.post<Consultation>(
    '/consultations',
    booking
  );
  return response.data;
}

/**
 * Get all consultations for the current user
 */
export async function getMyConsultations(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  consultations: Consultation[];
  total: number;
  page: number;
  limit: number;
}> {
  const response = await apiClient.get('/consultations/my', { params });
  return response.data;
}

/**
 * Get consultation by ID
 */
export async function getConsultationById(id: string): Promise<Consultation> {
  const response = await apiClient.get<Consultation>(`/consultations/${id}`);
  return response.data;
}

/**
 * Cancel a consultation
 */
export async function cancelConsultation(id: string): Promise<Consultation> {
  const response = await apiClient.post<Consultation>(
    `/consultations/${id}/cancel`
  );
  return response.data;
}

/**
 * Reschedule a consultation
 */
export async function rescheduleConsultation(
  id: string,
  newDate: string,
  newTime: string
): Promise<Consultation> {
  const response = await apiClient.post<Consultation>(
    `/consultations/${id}/reschedule`,
    {
      consultationDate: newDate,
      consultationTime: newTime,
    }
  );
  return response.data;
}

/**
 * Join video consultation
 */
export async function joinVideoConsultation(id: string): Promise<{
  meetingUrl: string;
  meetingId: string;
  accessToken: string;
}> {
  const response = await apiClient.post(`/consultations/${id}/join`);
  return response.data;
}

/**
 * Get prescription for consultation
 */
export async function getConsultationPrescription(
  consultationId: string
): Promise<any> {
  const response = await apiClient.get(
    `/consultations/${consultationId}/prescription`
  );
  return response.data;
}

/**
 * Download prescription PDF
 */
export async function downloadPrescription(
  consultationId: string
): Promise<Blob> {
  const response = await apiClient.get(
    `/consultations/${consultationId}/prescription/download`,
    {
      responseType: 'blob',
    }
  );
  return response.data;
}

/**
 * Rate a doctor after consultation
 */
export async function rateDoctorConsultation(
  consultationId: string,
  rating: number,
  review?: string
): Promise<void> {
  await apiClient.post(`/consultations/${consultationId}/rate`, {
    rating,
    review,
  });
}

/**
 * Get upcoming consultations
 */
export async function getUpcomingConsultations(): Promise<Consultation[]> {
  const response = await apiClient.get<Consultation[]>(
    '/consultations/upcoming'
  );
  return response.data;
}

/**
 * Get past consultations
 */
export async function getPastConsultations(): Promise<Consultation[]> {
  const response = await apiClient.get<Consultation[]>('/consultations/past');
  return response.data;
}

/**
 * Get doctor reviews
 */
export async function getDoctorReviews(
  doctorId: string,
  params?: { page?: number; limit?: number }
): Promise<{
  reviews: any[];
  total: number;
  averageRating: number;
}> {
  const response = await apiClient.get(`/doctors/${doctorId}/reviews`, {
    params,
  });
  return response.data;
}

/**
 * Get popular doctors
 */
export async function getPopularDoctors(limit: number = 10): Promise<Doctor[]> {
  const response = await apiClient.get<Doctor[]>('/doctors/popular', {
    params: { limit },
  });
  return response.data;
}

/**
 * Get featured doctors
 */
export async function getFeaturedDoctors(limit: number = 6): Promise<Doctor[]> {
  const response = await apiClient.get<Doctor[]>('/doctors/featured', {
    params: { limit },
  });
  return response.data;
}
