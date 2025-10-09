import { apiClient } from './client';

// Lab Test Types
export interface LabTest {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountedPrice?: number;
  preparationInstructions?: string;
  sampleType: string;
  reportDeliveryTime: string; // e.g., "24 hours", "48 hours"
  fastingRequired: boolean;
  homeCollectionAvailable: boolean;
  popularityScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LabPackage {
  id: string;
  name: string;
  description: string;
  tests: string[]; // Array of test IDs
  testDetails?: LabTest[];
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  popularityScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LabBooking {
  id: string;
  userId: string;
  testIds: string[];
  packageIds?: string[];
  tests?: LabTest[];
  packages?: LabPackage[];
  totalAmount: number;
  patientName: string;
  patientAge: number;
  patientGender: 'MALE' | 'FEMALE' | 'OTHER';
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  collectionDate: string;
  collectionTimeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING';
  status: 'PENDING' | 'CONFIRMED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentId?: string;
  reportUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLabBookingInput {
  testIds: string[];
  packageIds?: string[];
  patientName: string;
  patientAge: number;
  patientGender: 'MALE' | 'FEMALE' | 'OTHER';
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  collectionDate: string;
  collectionTimeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING';
}

// API Functions
export const labTestsApi = {
  // Lab Tests
  getTests: async (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    homeCollection?: boolean;
    fasting?: boolean;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tests: LabTest[]; total: number; page: number; limit: number }> => {
    const response = await apiClient.get('/lab-tests', { params });
    return response.data;
  },

  getTestById: async (id: string): Promise<LabTest> => {
    const response = await apiClient.get(`/lab-tests/${id}`);
    return response.data;
  },

  getTestsByCategory: async (category: string): Promise<LabTest[]> => {
    const response = await apiClient.get(`/lab-tests/category/${category}`);
    return response.data;
  },

  getPopularTests: async (limit: number = 10): Promise<LabTest[]> => {
    const response = await apiClient.get('/lab-tests/popular', { params: { limit } });
    return response.data;
  },

  // Lab Packages
  getPackages: async (params?: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ packages: LabPackage[]; total: number; page: number; limit: number }> => {
    const response = await apiClient.get('/lab-packages', { params });
    return response.data;
  },

  getPackageById: async (id: string): Promise<LabPackage> => {
    const response = await apiClient.get(`/lab-packages/${id}`);
    return response.data;
  },

  getPopularPackages: async (limit: number = 10): Promise<LabPackage[]> => {
    const response = await apiClient.get('/lab-packages/popular', { params: { limit } });
    return response.data;
  },

  // Lab Bookings
  createBooking: async (data: CreateLabBookingInput): Promise<LabBooking> => {
    const response = await apiClient.post('/lab-bookings', data);
    return response.data;
  },

  getMyBookings: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ bookings: LabBooking[]; total: number; page: number; limit: number }> => {
    const response = await apiClient.get('/lab-bookings/my-bookings', { params });
    return response.data;
  },

  getBookingById: async (id: string): Promise<LabBooking> => {
    const response = await apiClient.get(`/lab-bookings/${id}`);
    return response.data;
  },

  cancelBooking: async (id: string, reason: string): Promise<LabBooking> => {
    const response = await apiClient.patch(`/lab-bookings/${id}/cancel`, { reason });
    return response.data;
  },

  downloadReport: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/lab-bookings/${id}/report`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Search and Autocomplete
  searchTests: async (query: string): Promise<LabTest[]> => {
    const response = await apiClient.get('/lab-tests/search', { params: { q: query } });
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get('/lab-tests/categories');
    return response.data;
  },
};

export default labTestsApi;
