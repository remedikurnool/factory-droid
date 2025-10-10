import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Types
export interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'payout' | 'adjustment';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  orderId?: string;
  orderNumber?: string;
  userId?: string;
  userName?: string;
  paymentMethod: string;
  transactionId?: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
}

export interface FinancialStats {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  pendingPayments: number;
  refundsIssued: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface Refund {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedBy: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface Payout {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  period: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduledDate: string;
  completedDate?: string;
}

// API Client
export const financeApi = {
  // Transactions
  getTransactions: async (filters: any = {}) => {
    const response = await axios.get(`${API_URL}/admin/transactions`, { params: filters });
    return response.data;
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    const response = await axios.get(`${API_URL}/admin/transactions/${id}`);
    return response.data;
  },

  // Refunds
  getRefunds: async (filters: any = {}) => {
    const response = await axios.get(`${API_URL}/admin/refunds`, { params: filters });
    return response.data;
  },

  approveRefund: async (id: string): Promise<Refund> => {
    const response = await axios.post(`${API_URL}/admin/refunds/${id}/approve`);
    return response.data;
  },

  rejectRefund: async (id: string, reason: string): Promise<Refund> => {
    const response = await axios.post(`${API_URL}/admin/refunds/${id}/reject`, { reason });
    return response.data;
  },

  processRefund: async (id: string): Promise<Refund> => {
    const response = await axios.post(`${API_URL}/admin/refunds/${id}/process`);
    return response.data;
  },

  // Payouts
  getPayouts: async (filters: any = {}) => {
    const response = await axios.get(`${API_URL}/admin/payouts`, { params: filters });
    return response.data;
  },

  createPayout: async (data: Partial<Payout>): Promise<Payout> => {
    const response = await axios.post(`${API_URL}/admin/payouts`, data);
    return response.data;
  },

  processPayout: async (id: string): Promise<Payout> => {
    const response = await axios.post(`${API_URL}/admin/payouts/${id}/process`);
    return response.data;
  },

  // Statistics
  getStats: async (): Promise<FinancialStats> => {
    const response = await axios.get(`${API_URL}/admin/finance/stats`);
    return response.data;
  },

  // Reports
  getRevenueReport: async (startDate: string, endDate: string) => {
    const response = await axios.get(`${API_URL}/admin/finance/revenue-report`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Export
  exportTransactions: async (format: 'csv' | 'excel' = 'csv') => {
    const response = await axios.get(`${API_URL}/admin/transactions/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
};
