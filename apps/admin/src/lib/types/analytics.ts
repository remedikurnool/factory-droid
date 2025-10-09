/**
 * Admin Analytics & Reporting Types
 * Types for dashboard KPIs, charts, reports, and analytics
 */

// ============ Dashboard KPIs ============

export interface RevenueKPI {
  today: number
  yesterday: number
  week: number
  month: number
  lastMonth: number
  dateRange?: {
    start: string
    end: string
    total: number
  }
  growth: {
    daily: number // % change vs yesterday
    weekly: number // % change vs last week
    monthly: number // % change vs last month
  }
}

export interface OrdersKPI {
  total: number
  pending: number
  confirmed: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  returned: number
  growth: {
    daily: number
    weekly: number
    monthly: number
  }
}

export interface CustomersKPI {
  total: number
  new: number
  returning: number
  active: number
  growth: {
    daily: number
    weekly: number
    monthly: number
  }
}

export interface PerformanceKPI {
  averageOrderValue: number
  conversionRate: number
  cartAbandonmentRate: number
  customerLifetimeValue: number
  repeatPurchaseRate: number
}

export interface DashboardKPIs {
  revenue: RevenueKPI
  orders: OrdersKPI
  customers: CustomersKPI
  performance: PerformanceKPI
  updatedAt: string
}

// ============ Charts & Graphs ============

export interface RevenueTrendData {
  date: string
  revenue: number
  orders: number
  customers: number
}

export interface OrdersByStatusData {
  status: string
  count: number
  percentage: number
  color: string
}

export interface TopProductData {
  id: string
  name: string
  sales: number
  revenue: number
  units: number
}

export interface CustomerGrowthData {
  date: string
  newCustomers: number
  returningCustomers: number
  totalCustomers: number
}

export interface HourlyOrderData {
  hour: string
  orders: number
}

export interface ServiceModuleOrdersData {
  module: 'MEDICINES' | 'LAB_TESTS' | 'HOMECARE' | 'EMERGENCY' | 'INSURANCE'
  count: number
  revenue: number
  percentage: number
  color: string
}

// ============ Real-time Data ============

export interface LiveData {
  orderCount: number
  activeUsers: number
  todayRevenue: number
  lastUpdate: string
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  amount: number
  status: string
  items: number
  paymentMethod: string
  createdAt: string
}

// ============ Sales Reports ============

export interface SalesReport {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
  startDate: string
  endDate: string
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalDiscount: number
  netRevenue: number
  topProducts: TopProductData[]
  salesByCategory: SalesByCategoryData[]
  salesByBrand: SalesByBrandData[]
  salesByDay: SalesByDayData[]
}

export interface SalesByCategoryData {
  category: string
  revenue: number
  orders: number
  percentage: number
}

export interface SalesByBrandData {
  brand: string
  revenue: number
  orders: number
  units: number
  percentage: number
}

export interface SalesByDayData {
  date: string
  revenue: number
  orders: number
  customers: number
}

export interface DiscountImpactReport {
  totalDiscounts: number
  averageDiscount: number
  ordersWithDiscount: number
  ordersWithoutDiscount: number
  discountTypes: {
    type: string
    count: number
    amount: number
  }[]
  revenueImpact: number
  conversionImpact: number
}

// ============ Inventory Reports ============

export interface InventoryReport {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  expiringItems: number
  stockLevels: StockLevelData[]
  lowStockAlerts: LowStockAlert[]
  fastMovingItems: FastMovingItem[]
  slowMovingItems: SlowMovingItem[]
  expiryReport: ExpiryReportData[]
}

export interface StockLevelData {
  productId: string
  productName: string
  sku: string
  currentStock: number
  minStock: number
  maxStock: number
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  value: number
}

export interface LowStockAlert {
  productId: string
  productName: string
  currentStock: number
  minStock: number
  daysRemaining: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface FastMovingItem {
  productId: string
  productName: string
  unitsSold: number
  revenue: number
  turnoverRate: number
}

export interface SlowMovingItem {
  productId: string
  productName: string
  unitsSold: number
  daysInStock: number
  currentStock: number
  value: number
}

export interface ExpiryReportData {
  productId: string
  productName: string
  batchNumber: string
  expiryDate: string
  daysToExpiry: number
  quantity: number
  value: number
  status: 'EXPIRED' | 'EXPIRING_SOON' | 'CRITICAL'
}

// ============ Customer Reports ============

export interface CustomerReport {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  activeCustomers: number
  churnedCustomers: number
  averageLifetimeValue: number
  churnRate: number
  retentionRate: number
  acquisitionCost: number
  newCustomersByDate: NewCustomerData[]
  topCustomers: TopCustomerData[]
  customerGeography: CustomerGeographyData[]
  customerSegments: CustomerSegmentData[]
}

export interface NewCustomerData {
  date: string
  count: number
  source: string
}

export interface TopCustomerData {
  customerId: string
  customerName: string
  email: string
  totalSpend: number
  totalOrders: number
  averageOrderValue: number
  lastOrderDate: string
}

export interface CustomerGeographyData {
  state: string
  city: string
  customers: number
  revenue: number
  percentage: number
}

export interface CustomerSegmentData {
  segment: string
  customers: number
  revenue: number
  averageOrderValue: number
}

// ============ Financial Reports ============

export interface FinancialReport {
  totalRevenue: number
  netRevenue: number
  totalTax: number
  totalCommissions: number
  totalRefunds: number
  paymentMethodBreakdown: PaymentMethodData[]
  refundReport: RefundData[]
  taxReport: TaxReportData
  commissionReport: CommissionData[]
}

export interface PaymentMethodData {
  method: string
  transactions: number
  amount: number
  percentage: number
  fees: number
}

export interface RefundData {
  orderId: string
  orderNumber: string
  customerName: string
  amount: number
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED'
  requestedDate: string
  processedDate?: string
}

export interface TaxReportData {
  cgst: number
  sgst: number
  igst: number
  total: number
  taxableAmount: number
  exemptAmount: number
}

export interface CommissionData {
  partnerId: string
  partnerName: string
  type: 'VENDOR' | 'LAB' | 'HOMECARE' | 'INSURANCE'
  totalSales: number
  commissionRate: number
  commissionAmount: number
  paidAmount: number
  pendingAmount: number
}

// ============ Quick Actions ============

export interface QuickActionData {
  pendingOrders: number
  pendingRefunds: number
  lowStockAlerts: number
  expiringProducts: number
  unreadMessages: number
  pendingReviews: number
}

// ============ Export Options ============

export interface ExportOptions {
  format: 'CSV' | 'PDF' | 'EXCEL'
  reportType: 'SALES' | 'INVENTORY' | 'CUSTOMERS' | 'FINANCIAL'
  dateRange: {
    start: string
    end: string
  }
  filters?: Record<string, any>
}

export interface ExportResponse {
  url: string
  filename: string
  expiresAt: string
}

// ============ Scheduled Reports ============

export interface ScheduledReport {
  id: string
  name: string
  reportType: 'SALES' | 'INVENTORY' | 'CUSTOMERS' | 'FINANCIAL'
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  format: 'CSV' | 'PDF' | 'EXCEL'
  recipients: string[]
  filters?: Record<string, any>
  enabled: boolean
  lastRun?: string
  nextRun: string
  createdAt: string
}

export interface CreateScheduledReportRequest {
  name: string
  reportType: 'SALES' | 'INVENTORY' | 'CUSTOMERS' | 'FINANCIAL'
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  format: 'CSV' | 'PDF' | 'EXCEL'
  recipients: string[]
  filters?: Record<string, any>
}

// ============ Filter Options ============

export interface ReportFilters {
  dateRange?: {
    start: string
    end: string
  }
  category?: string
  brand?: string
  status?: string
  paymentMethod?: string
  customerId?: string
  productId?: string
  minAmount?: number
  maxAmount?: number
}
