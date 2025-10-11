// Hospital API Client

import { apiClient } from './client';
import type {
  Hospital,
  HospitalListResponse,
  HospitalSearchParams,
} from '@/types/hospital';

/**
 * Get all hospitals with filters and pagination
 */
export async function getHospitals(
  params?: HospitalSearchParams
): Promise<HospitalListResponse> {
  const response = await apiClient.get<HospitalListResponse>('/hospitals', {
    params,
  });
  return response.data;
}

/**
 * Get hospital by ID
 */
export async function getHospitalById(id: string): Promise<Hospital> {
  const response = await apiClient.get<Hospital>(`/hospitals/${id}`);
  return response.data;
}

/**
 * Search hospitals
 */
export async function searchHospitals(query: string): Promise<Hospital[]> {
  const response = await apiClient.get<Hospital[]>('/hospitals/search', {
    params: { q: query },
  });
  return response.data;
}

/**
 * Get hospitals by city
 */
export async function getHospitalsByCity(city: string): Promise<Hospital[]> {
  const response = await apiClient.get<Hospital[]>('/hospitals/city', {
    params: { city },
  });
  return response.data;
}

/**
 * Get featured hospitals
 */
export async function getFeaturedHospitals(limit: number = 6): Promise<Hospital[]> {
  const response = await apiClient.get<Hospital[]>('/hospitals/featured', {
    params: { limit },
  });
  return response.data;
}

/**
 * Get hospital reviews
 */
export async function getHospitalReviews(
  hospitalId: string,
  params?: { page?: number; limit?: number }
): Promise<{
  reviews: any[];
  total: number;
  averageRating: number;
}> {
  const response = await apiClient.get(`/hospitals/${hospitalId}/reviews`, {
    params,
  });
  return response.data;
}

/**
 * Get nearby hospitals based on location
 */
export async function getNearbyHospitals(
  latitude: number,
  longitude: number,
  radius: number = 10
): Promise<Hospital[]> {
  const response = await apiClient.get<Hospital[]>('/hospitals/nearby', {
    params: { latitude, longitude, radius },
  });
  return response.data;
}
