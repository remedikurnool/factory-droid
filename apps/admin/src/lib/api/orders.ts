/**
 * Order Management API Client
 * API methods for orders, prescriptions, and order management
 */

import axios from 'axios'
import type {
  Order,
  OrderFilters,
  OrderStats,
  PaginatedOrdersResponse,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  RefundOrderRequest,
  AssignDeliveryPartnerRequest,
  UpdateTrackingRequest,
  AddOrderNoteRequest,
  BulkOrderAction,
  ExportOrdersRequest,
  ExportOrdersResponse,
  Prescription,
  PrescriptionStatus,
  VerifyPrescriptionRequest,
  PrescriptionVerificationStats,
  DeliveryPartner,
  Invoice,
  InvoiceDownloadRequest,
} from '../types/orders'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ============ Order Management APIs ============

export const orderAPI = {
  /**
   * Get paginated list of orders
   */
  getOrders: async (params: {
    page: number
    pageSize: number
    filters?: OrderFilters
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedOrdersResponse> => {
    const response = await api.get('/admin/orders', { params })
    return response.data
  },

  /**
   * Get single order by ID
   */
  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/admin/orders/${id}`)
    return response.data
  },

  /**
   * Get order statistics
   */
  getOrderStats: async (): Promise<OrderStats> => {
    const response = await api.get('/admin/orders/stats')
    return response.data
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (data: UpdateOrderStatusRequest): Promise<Order> => {
    const response = await api.patch(`/admin/orders/${data.orderId}/status`, data)
    return response.data
  },

  /**
   * Cancel order
   */
  cancelOrder: async (data: CancelOrderRequest): Promise<Order> => {
    const response = await api.post(`/admin/orders/${data.orderId}/cancel`, data)
    return response.data
  },

  /**
   * Initiate refund
   */
  initiateRefund: async (data: RefundOrderRequest): Promise<Order> => {
    const response = await api.post(`/admin/orders/${data.orderId}/refund`, data)
    return response.data
  },

  /**
   * Assign delivery partner
   */
  assignDeliveryPartner: async (data: AssignDeliveryPartnerRequest): Promise<Order> => {
    const response = await api.post(`/admin/orders/${data.orderId}/assign-delivery-partner`, data)
    return response.data
  },

  /**
   * Update tracking details
   */
  updateTracking: async (data: UpdateTrackingRequest): Promise<Order> => {
    const response = await api.patch(`/admin/orders/${data.orderId}/tracking`, data)
    return response.data
  },

  /**
   * Add order note
   */
  addOrderNote: async (data: AddOrderNoteRequest): Promise<Order> => {
    const response = await api.post(`/admin/orders/${data.orderId}/notes`, data)
    return response.data
  },

  /**
   * Bulk action on orders
   */
  bulkActionOrders: async (data: BulkOrderAction): Promise<void> => {
    await api.post('/admin/orders/bulk-action', data)
  },

  /**
   * Export orders
   */
  exportOrders: async (request: ExportOrdersRequest): Promise<ExportOrdersResponse> => {
    const response = await api.post('/admin/orders/export', request)
    return response.data
  },

  /**
   * Get delivery partners
   */
  getDeliveryPartners: async (): Promise<DeliveryPartner[]> => {
    const response = await api.get('/admin/delivery-partners')
    return response.data
  },

  /**
   * Download invoice
   */
  downloadInvoice: async (request: InvoiceDownloadRequest): Promise<ExportOrdersResponse> => {
    const response = await api.post(`/admin/orders/${request.orderId}/invoice`, request)
    return response.data
  },

  /**
   * Print invoice
   */
  printInvoice: async (orderId: string): Promise<void> => {
    const response = await api.get(`/admin/orders/${orderId}/invoice`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `invoice-${orderId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },
}

// ============ Prescription Management APIs ============

export const prescriptionAPI = {
  /**
   * Get prescriptions requiring verification
   */
  getPendingPrescriptions: async (params: {
    page: number
    pageSize: number
    status?: PrescriptionStatus
  }): Promise<{ data: Prescription[]; total: number; page: number; pageSize: number }> => {
    const response = await api.get('/admin/prescriptions/pending', { params })
    return response.data
  },

  /**
   * Get prescription by ID
   */
  getPrescription: async (id: string): Promise<Prescription> => {
    const response = await api.get(`/admin/prescriptions/${id}`)
    return response.data
  },

  /**
   * Get prescriptions for an order
   */
  getOrderPrescriptions: async (orderId: string): Promise<Prescription[]> => {
    const response = await api.get(`/admin/orders/${orderId}/prescriptions`)
    return response.data
  },

  /**
   * Verify prescription
   */
  verifyPrescription: async (data: VerifyPrescriptionRequest): Promise<Prescription> => {
    const response = await api.post(`/admin/prescriptions/${data.prescriptionId}/verify`, data)
    return response.data
  },

  /**
   * Request additional documents
   */
  requestAdditionalDocuments: async (prescriptionId: string, note: string): Promise<Prescription> => {
    const response = await api.post(`/admin/prescriptions/${prescriptionId}/request-documents`, { note })
    return response.data
  },

  /**
   * Get prescription verification statistics
   */
  getPrescriptionStats: async (): Promise<PrescriptionVerificationStats> => {
    const response = await api.get('/admin/prescriptions/stats')
    return response.data
  },

  /**
   * Download prescription file
   */
  downloadPrescription: async (prescriptionId: string): Promise<void> => {
    const response = await api.get(`/admin/prescriptions/${prescriptionId}/download`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `prescription-${prescriptionId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },
}

// Export combined API
export const ordersAPI = {
  orders: orderAPI,
  prescriptions: prescriptionAPI,
}

export default ordersAPI
