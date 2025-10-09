export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export type PaymentMethod = 'CARD' | 'UPI' | 'NET_BANKING' | 'COD' | 'WALLET'

export interface Address {
  id: string
  userId: string
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  landmark?: string
  addressType: 'HOME' | 'WORK' | 'OTHER'
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  medicineId: string
  medicineName: string
  medicineImage?: string
  quantity: number
  price: number
  discount: number
  prescriptionRequired: boolean
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  items: OrderItem[]
  
  // Pricing
  subtotal: number
  discount: number
  deliveryFee: number
  tax: number
  total: number
  
  // Delivery
  deliveryAddress: Address
  deliverySlot?: string
  estimatedDeliveryDate?: string
  deliveryPartnerId?: string
  deliveryPartnerName?: string
  deliveryPartnerPhone?: string
  deliveryOtp?: string
  
  // Prescription
  prescriptionUrl?: string
  prescriptionVerified: boolean
  
  // Tracking
  trackingUpdates: OrderTrackingUpdate[]
  
  // Payment
  razorpayOrderId?: string
  razorpayPaymentId?: string
  
  // Coupon
  couponCode?: string
  couponDiscount: number
  
  // Metadata
  notes?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

export interface OrderTrackingUpdate {
  id: string
  orderId: string
  status: OrderStatus
  message: string
  location?: string
  timestamp: string
}

export interface DeliverySlot {
  id: string
  date: string
  startTime: string
  endTime: string
  available: boolean
  slotLabel: string
}

export interface Coupon {
  id: string
  code: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minOrderValue: number
  maxDiscountAmount?: number
  validFrom: string
  validUntil: string
  usageLimit?: number
  usageCount: number
  isActive: boolean
}

export interface CheckoutState {
  step: number // 1-4
  selectedAddressId?: string
  selectedDeliverySlot?: DeliverySlot
  selectedPaymentMethod?: PaymentMethod
  couponCode?: string
  couponDiscount: number
  notes?: string
  prescriptionFile?: File
}
