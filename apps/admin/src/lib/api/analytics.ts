/**
 * Admin Analytics & Reporting API Client
 * API methods for dashboard, KPIs, charts, and reports
 */

import { apiClient } from './client'
import type {
  DashboardKPIs,
  RevenueTrendData,
  OrdersByStatusData,
  TopProductData,
  CustomerGrowthData,
  HourlyOrderData,
  ServiceModuleOrdersData,
  LiveData,
  RecentOrder,
  SalesReport,
  DiscountImpactReport,
  InventoryReport,
  CustomerReport,
  FinancialReport,
  QuickActionData,
  ExportOptions,
  ExportResponse,
  ScheduledReport,
  CreateScheduledReportRequest,
  ReportFilters,
} from '@/lib/types/analytics'

export const analyticsAPI = {
  // ============ Dashboard KPIs ============

  /**
   * Get all dashboard KPIs
   */
  async getDashboardKPIs(dateRange?: { start: string; end: string }): Promise<DashboardKPIs> {
    const response = await apiClient.get('/admin/analytics/dashboard/kpis', {
      params: dateRange,
    })
    return response.data
  },

  /**
   * Get revenue KPI details
   */
  async getRevenueKPI(dateRange?: { start: string; end: string }) {
    const response = await apiClient.get('/admin/analytics/kpis/revenue', {
      params: dateRange,
    })
    return response.data
  },

  /**
   * Get orders KPI details
   */
  async getOrdersKPI() {
    const response = await apiClient.get('/admin/analytics/kpis/orders')
    return response.data
  },

  /**
   * Get customers KPI details
   */
  async getCustomersKPI() {
    const response = await apiClient.get('/admin/analytics/kpis/customers')
    return response.data
  },

  /**
   * Get performance KPI details
   */
  async getPerformanceKPI() {
    const response = await apiClient.get('/admin/analytics/kpis/performance')
    return response.data
  },

  // ============ Charts & Graphs ============

  /**
   * Get revenue trend data for line chart
   */
  async getRevenueTrend(days: number = 30): Promise<RevenueTrendData[]> {
    const response = await apiClient.get('/admin/analytics/charts/revenue-trend', {
      params: { days },
    })
    return response.data
  },

  /**
   * Get orders by status for pie chart
   */
  async getOrdersByStatus(): Promise<OrdersByStatusData[]> {
    const response = await apiClient.get('/admin/analytics/charts/orders-by-status')
    return response.data
  },

  /**
   * Get top selling products for bar chart
   */
  async getTopProducts(limit: number = 10): Promise<TopProductData[]> {
    const response = await apiClient.get('/admin/analytics/charts/top-products', {
      params: { limit },
    })
    return response.data
  },

  /**
   * Get customer growth data for area chart
   */
  async getCustomerGrowth(days: number = 30): Promise<CustomerGrowthData[]> {
    const response = await apiClient.get('/admin/analytics/charts/customer-growth', {
      params: { days },
    })
    return response.data
  },

  /**
   * Get hourly order distribution for heatmap
   */
  async getHourlyOrders(): Promise<HourlyOrderData[]> {
    const response = await apiClient.get('/admin/analytics/charts/hourly-orders')
    return response.data
  },

  /**
   * Get orders by service module for pie chart
   */
  async getOrdersByServiceModule(): Promise<ServiceModuleOrdersData[]> {
    const response = await apiClient.get('/admin/analytics/charts/orders-by-service')
    return response.data
  },

  // ============ Real-time Data ============

  /**
   * Get live dashboard data
   */
  async getLiveData(): Promise<LiveData> {
    const response = await apiClient.get('/admin/analytics/live')
    return response.data
  },

  /**
   * Get recent orders
   */
  async getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
    const response = await apiClient.get('/admin/analytics/recent-orders', {
      params: { limit },
    })
    return response.data
  },

  /**
   * Get quick action counts
   */
  async getQuickActions(): Promise<QuickActionData> {
    const response = await apiClient.get('/admin/analytics/quick-actions')
    return response.data
  },

  // ============ Sales Reports ============

  /**
   * Get sales report
   */
  async getSalesReport(params: {
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
    startDate?: string
    endDate?: string
    filters?: ReportFilters
  }): Promise<SalesReport> {
    const response = await apiClient.get('/admin/reports/sales', { params })
    return response.data
  },

  /**
   * Get discount impact analysis
   */
  async getDiscountImpact(params: {
    startDate: string
    endDate: string
  }): Promise<DiscountImpactReport> {
    const response = await apiClient.get('/admin/reports/discount-impact', { params })
    return response.data
  },

  /**
   * Get sales by category
   */
  async getSalesByCategory(params: { startDate: string; endDate: string }) {
    const response = await apiClient.get('/admin/reports/sales-by-category', { params })
    return response.data
  },

  /**
   * Get sales by brand
   */
  async getSalesByBrand(params: { startDate: string; endDate: string }) {
    const response = await apiClient.get('/admin/reports/sales-by-brand', { params })
    return response.data
  },

  // ============ Inventory Reports ============

  /**
   * Get inventory report
   */
  async getInventoryReport(): Promise<InventoryReport> {
    const response = await apiClient.get('/admin/reports/inventory')
    return response.data
  },

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(priority?: 'HIGH' | 'MEDIUM' | 'LOW') {
    const response = await apiClient.get('/admin/reports/low-stock-alerts', {
      params: { priority },
    })
    return response.data
  },

  /**
   * Get fast moving items
   */
  async getFastMovingItems(limit: number = 20) {
    const response = await apiClient.get('/admin/reports/fast-moving-items', {
      params: { limit },
    })
    return response.data
  },

  /**
   * Get slow moving items
   */
  async getSlowMovingItems(limit: number = 20) {
    const response = await apiClient.get('/admin/reports/slow-moving-items', {
      params: { limit },
    })
    return response.data
  },

  /**
   * Get expiry report
   */
  async getExpiryReport(daysAhead: number = 90) {
    const response = await apiClient.get('/admin/reports/expiry', {
      params: { daysAhead },
    })
    return response.data
  },

  // ============ Customer Reports ============

  /**
   * Get customer report
   */
  async getCustomerReport(params: {
    startDate: string
    endDate: string
  }): Promise<CustomerReport> {
    const response = await apiClient.get('/admin/reports/customers', { params })
    return response.data
  },

  /**
   * Get top customers by spend
   */
  async getTopCustomers(limit: number = 50) {
    const response = await apiClient.get('/admin/reports/top-customers', {
      params: { limit },
    })
    return response.data
  },

  /**
   * Get customer geography data
   */
  async getCustomerGeography() {
    const response = await apiClient.get('/admin/reports/customer-geography')
    return response.data
  },

  /**
   * Get customer acquisition data
   */
  async getCustomerAcquisition(params: { startDate: string; endDate: string }) {
    const response = await apiClient.get('/admin/reports/customer-acquisition', { params })
    return response.data
  },

  // ============ Financial Reports ============

  /**
   * Get financial report
   */
  async getFinancialReport(params: {
    startDate: string
    endDate: string
  }): Promise<FinancialReport> {
    const response = await apiClient.get('/admin/reports/financial', { params })
    return response.data
  },

  /**
   * Get payment method breakdown
   */
  async getPaymentMethodBreakdown(params: { startDate: string; endDate: string }) {
    const response = await apiClient.get('/admin/reports/payment-methods', { params })
    return response.data
  },

  /**
   * Get refund report
   */
  async getRefundReport(params: {
    startDate: string
    endDate: string
    status?: string
  }) {
    const response = await apiClient.get('/admin/reports/refunds', { params })
    return response.data
  },

  /**
   * Get tax report (GST)
   */
  async getTaxReport(params: { startDate: string; endDate: string }) {
    const response = await apiClient.get('/admin/reports/tax', { params })
    return response.data
  },

  /**
   * Get commission/payout report
   */
  async getCommissionReport(params: { startDate: string; endDate: string }) {
    const response = await apiClient.get('/admin/reports/commissions', { params })
    return response.data
  },

  // ============ Export Reports ============

  /**
   * Export report to CSV/PDF/Excel
   */
  async exportReport(options: ExportOptions): Promise<ExportResponse> {
    const response = await apiClient.post('/admin/reports/export', options)
    return response.data
  },

  /**
   * Download exported report
   */
  async downloadReport(url: string): Promise<Blob> {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    })
    return response.data
  },

  // ============ Scheduled Reports ============

  /**
   * Get all scheduled reports
   */
  async getScheduledReports(): Promise<ScheduledReport[]> {
    const response = await apiClient.get('/admin/reports/scheduled')
    return response.data
  },

  /**
   * Create scheduled report
   */
  async createScheduledReport(data: CreateScheduledReportRequest): Promise<ScheduledReport> {
    const response = await apiClient.post('/admin/reports/scheduled', data)
    return response.data
  },

  /**
   * Update scheduled report
   */
  async updateScheduledReport(
    id: string,
    data: Partial<CreateScheduledReportRequest>
  ): Promise<ScheduledReport> {
    const response = await apiClient.put(`/admin/reports/scheduled/${id}`, data)
    return response.data
  },

  /**
   * Delete scheduled report
   */
  async deleteScheduledReport(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/admin/reports/scheduled/${id}`)
    return response.data
  },

  /**
   * Toggle scheduled report status
   */
  async toggleScheduledReport(id: string, enabled: boolean): Promise<ScheduledReport> {
    const response = await apiClient.patch(`/admin/reports/scheduled/${id}/toggle`, { enabled })
    return response.data
  },

  /**
   * Trigger scheduled report immediately
   */
  async triggerScheduledReport(id: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/admin/reports/scheduled/${id}/trigger`)
    return response.data
  },

  // ============ Quick Actions ============

  /**
   * Send bulk notification
   */
  async sendNotification(data: {
    title: string
    message: string
    type: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'PROMOTION' | 'SYSTEM'
    recipients: 'ALL' | 'SEGMENT'
    segmentId?: string
  }): Promise<{ message: string; sent: number }> {
    const response = await apiClient.post('/admin/notifications/send', data)
    return response.data
  },

  /**
   * Process refund
   */
  async processRefund(
    orderId: string,
    data: {
      amount: number
      reason: string
      method: string
    }
  ): Promise<{ message: string }> {
    const response = await apiClient.post(`/admin/refunds/${orderId}/process`, data)
    return response.data
  },
}
