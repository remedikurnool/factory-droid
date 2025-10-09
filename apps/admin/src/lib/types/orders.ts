/**
 * Order Management Types
 * Types for orders, order items, prescriptions, and order management
 */

// ============ Order Types ============

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customer: Customer
  items: OrderItem[]
  subtotal: number
  discount: number
  deliveryCharges: number
  tax: number
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentId?: string
  transactionId?: string
  orderStatus: OrderStatus
  deliveryAddress: Address
  deliveryPartner?: DeliveryPartner
  trackingNumber?: string
  trackingUrl?: string
  prescriptionRequired: boolean
  prescriptionStatus?: PrescriptionStatus
  prescriptions?: Prescription[]
  notes: OrderNote[]
  timeline: OrderTimeline[]
  estimatedDeliveryDate?: string
  actualDeliveryDate?: string
  cancelledAt?: string
  cancelReason?: string
  refundStatus?: RefundStatus
  refundAmount?: number
  refundId?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productType: ProductType
  sku: string
  quantity: number
  price: number
  discount: number
  tax: number
  total: number
  prescriptionRequired: boolean
  image?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  totalOrders: number
  totalSpent: number
}

export interface Address {
  id: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  landmark?: string
  addressType: 'HOME' | 'WORK' | 'OTHER'
}

export interface DeliveryPartner {
  id: string
  name: string
  phone: string
  vehicleNumber?: string
  rating?: number
}

export interface Prescription {
  id: string
  orderId: string
  customerId: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
  status: PrescriptionStatus
  verifiedBy?: string
  verifiedAt?: string
  rejectionReason?: string
  additionalDocumentsRequested?: boolean
  additionalDocumentsNote?: string
}

export interface OrderNote {
  id: string
  orderId: string
  userId: string
  userName: string
  note: string
  isInternal: boolean
  createdAt: string
}

export interface OrderTimeline {
  id: string
  orderId: string
  status: OrderStatus
  title: string
  description: string
  timestamp: string
  userId?: string
  userName?: string
}

// ============ Enums ============

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PRESCRIPTION_PENDING = 'PRESCRIPTION_PENDING',
  PRESCRIPTION_VERIFIED = 'PRESCRIPTION_VERIFIED',
  PRESCRIPTION_REJECTED = 'PRESCRIPTION_REJECTED',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  READY_TO_SHIP = 'READY_TO_SHIP',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  COD = 'COD',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  UPI = 'UPI',
  NET_BANKING = 'NET_BANKING',
  WALLET = 'WALLET',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PrescriptionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  ADDITIONAL_DOCUMENTS_REQUIRED = 'ADDITIONAL_DOCUMENTS_REQUIRED',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ProductType {
  MEDICINE = 'MEDICINE',
  LAB_TEST = 'LAB_TEST',
  HOMECARE_SERVICE = 'HOMECARE_SERVICE',
  INSURANCE = 'INSURANCE',
}

// ============ Request/Response Types ============

export interface OrderFilters {
  search?: string
  orderStatus?: OrderStatus
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod
  prescriptionStatus?: PrescriptionStatus
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  customerId?: string
  prescriptionRequired?: boolean
}

export interface UpdateOrderStatusRequest {
  orderId: string
  status: OrderStatus
  note?: string
}

export interface CancelOrderRequest {
  orderId: string
  reason: string
  refundAmount?: number
}

export interface RefundOrderRequest {
  orderId: string
  amount: number
  reason: string
}

export interface AssignDeliveryPartnerRequest {
  orderId: string
  deliveryPartnerId: string
}

export interface UpdateTrackingRequest {
  orderId: string
  trackingNumber: string
  trackingUrl: string
}

export interface AddOrderNoteRequest {
  orderId: string
  note: string
  isInternal: boolean
}

export interface VerifyPrescriptionRequest {
  prescriptionId: string
  status: 'VERIFIED' | 'REJECTED'
  rejectionReason?: string
  additionalDocumentsRequested?: boolean
  additionalDocumentsNote?: string
}

export interface BulkOrderAction {
  orderIds: string[]
  action: 'UPDATE_STATUS' | 'CANCEL' | 'EXPORT'
  status?: OrderStatus
  cancelReason?: string
}

export interface ExportOrdersRequest {
  format: 'CSV' | 'EXCEL' | 'PDF'
  filters?: OrderFilters
}

export interface ExportOrdersResponse {
  url: string
  filename: string
  expiresAt: string
}

export interface PaginatedOrdersResponse {
  data: Order[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalRevenue: number
  averageOrderValue: number
  prescriptionPendingCount: number
  refundPendingCount: number
}

export interface PrescriptionVerificationStats {
  pendingCount: number
  underReviewCount: number
  verifiedToday: number
  rejectedToday: number
  additionalDocsRequired: number
}

// ============ Invoice Types ============

export interface Invoice {
  invoiceNumber: string
  order: Order
  generatedAt: string
  dueDate: string
}

export interface InvoiceDownloadRequest {
  orderId: string
  format: 'PDF'
}
