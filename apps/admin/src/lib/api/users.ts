import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff' | 'pharmacist' | 'lab_technician' | 'doctor';
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  avatar?: string;
  addresses?: Address[];
  orders?: number;
  totalSpent?: number;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Staff {
  id: string;
  userId: string;
  user?: User;
  department: string;
  position: string;
  joinDate: string;
  salary?: number;
  permissions: string[];
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: User['role'];
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: User['role'];
  isActive?: boolean;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  newThisMonth: number;
  activeToday: number;
}

// API Client
export const usersApi = {
  // Get all users with filters
  getUsers: async (filters: UserFilters = {}) => {
    const response = await axios.get(`${API_URL}/admin/users`, { params: filters });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await axios.get(`${API_URL}/admin/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (data: CreateUserInput): Promise<User> => {
    const response = await axios.post(`${API_URL}/admin/users`, data);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserInput): Promise<User> => {
    const response = await axios.patch(`${API_URL}/admin/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/admin/users/${id}`);
  },

  // Activate user
  activateUser: async (id: string): Promise<User> => {
    const response = await axios.post(`${API_URL}/admin/users/${id}/activate`);
    return response.data;
  },

  // Deactivate user
  deactivateUser: async (id: string): Promise<User> => {
    const response = await axios.post(`${API_URL}/admin/users/${id}/deactivate`);
    return response.data;
  },

  // Reset user password
  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    await axios.post(`${API_URL}/admin/users/${id}/reset-password`, { password: newPassword });
  },

  // Get user statistics
  getStats: async (): Promise<UserStats> => {
    const response = await axios.get(`${API_URL}/admin/users/stats`);
    return response.data;
  },

  // Get user activity log
  getActivityLog: async (id: string) => {
    const response = await axios.get(`${API_URL}/admin/users/${id}/activity`);
    return response.data;
  },

  // Bulk actions
  bulkActivate: async (ids: string[]): Promise<void> => {
    await axios.post(`${API_URL}/admin/users/bulk-activate`, { ids });
  },

  bulkDeactivate: async (ids: string[]): Promise<void> => {
    await axios.post(`${API_URL}/admin/users/bulk-deactivate`, { ids });
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await axios.post(`${API_URL}/admin/users/bulk-delete`, { ids });
  },

  // Staff management
  getStaff: async (filters: UserFilters = {}) => {
    const response = await axios.get(`${API_URL}/admin/staff`, { params: filters });
    return response.data;
  },

  createStaff: async (data: Partial<Staff>): Promise<Staff> => {
    const response = await axios.post(`${API_URL}/admin/staff`, data);
    return response.data;
  },

  updateStaff: async (id: string, data: Partial<Staff>): Promise<Staff> => {
    const response = await axios.patch(`${API_URL}/admin/staff/${id}`, data);
    return response.data;
  },

  // Export users
  exportUsers: async (format: 'csv' | 'excel' = 'csv') => {
    const response = await axios.get(`${API_URL}/admin/users/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
};
