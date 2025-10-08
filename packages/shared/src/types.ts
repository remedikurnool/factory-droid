// User Types
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  walletBalance: number;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

// Medicine Types
export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brandId: string;
  categoryId: string;
  description: string;
  composition: string;
  manufacturer: string;
  isPrescriptionRequired: boolean;
  price: number;
  discountPrice?: number;
  stock: number;
  unit: string;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
}

// Lab Test Types
export interface LabTest {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number;
  discountPrice?: number;
  preparationInstructions?: string;
  reportDeliveryTime: string;
  sampleType: string;
  isFasting: boolean;
  isHomeSampleCollection: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface LabBooking {
  id: string;
  userId: string;
  testIds: string[];
  partnerId: string;
  slotDate: Date;
  slotTime: string;
  addressId: string;
  totalAmount: number;
  status: BookingStatus;
  paymentId?: string;
  prescriptionUrl?: string;
  reportUrl?: string;
  createdAt: Date;
}

// Doctor & Hospital Types
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  hospitalId?: string;
  consultationFee: number;
  image?: string;
  bio?: string;
  isActive: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  specialties: string[];
  facilities: string[];
  isActive: boolean;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: AppointmentStatus;
  symptoms?: string;
  prescriptionUrl?: string;
  consultationNotes?: string;
  amount: number;
  paymentId?: string;
  createdAt: Date;
}

// Service Types
export interface HomecareService {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  duration: string;
  isSubscriptionAvailable: boolean;
  subscriptionPlans?: SubscriptionPlan[];
  image?: string;
  isActive: boolean;
}

export interface ServiceBooking {
  id: string;
  userId: string;
  serviceId: string;
  addressId: string;
  scheduledDate: Date;
  scheduledTime: string;
  status: BookingStatus;
  amount: number;
  paymentId?: string;
  notes?: string;
  createdAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: number; // in days
  frequency: string; // daily, weekly, monthly
  price: number;
  savings: number;
}

// Ambulance & Blood Bank
export interface AmbulanceRequest {
  id: string;
  userId: string;
  patientName: string;
  patientAge: number;
  emergencyType: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationAddress: string;
  destinationLatitude: number;
  destinationLongitude: number;
  status: RequestStatus;
  driverId?: string;
  vehicleNumber?: string;
  estimatedArrival?: Date;
  createdAt: Date;
}

export interface BloodRequest {
  id: string;
  userId: string;
  bloodGroup: string;
  units: number;
  hospitalName: string;
  hospitalAddress: string;
  urgency: 'immediate' | 'urgent' | 'normal';
  patientName: string;
  contactNumber: string;
  status: RequestStatus;
  donorId?: string;
  notes?: string;
  createdAt: Date;
}

// Insurance Types
export interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  coverageAmount: number;
  premium: number;
  duration: number; // in years
  features: string[];
  terms?: string;
  isActive: boolean;
}

export interface InsurancePurchase {
  id: string;
  userId: string;
  planId: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeAge: number;
  startDate: Date;
  endDate: Date;
  premium: number;
  status: 'active' | 'expired' | 'cancelled';
  policyNumber: string;
  documentUrl?: string;
  createdAt: Date;
}

// Cart & Order Types
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  productType: 'medicine' | 'lab_test' | 'service';
  quantity: number;
  price: number;
  prescriptionRequired: boolean;
  prescriptionUrl?: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  addressId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  orderStatus: OrderStatus;
  prescriptionUrls: string[];
  invoiceUrl?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productType: 'medicine' | 'lab_test' | 'service';
  productName: string;
  quantity: number;
  price: number;
  discountPrice?: number;
  total: number;
}

// Payment Types
export interface Payment {
  id: string;
  orderId?: string;
  bookingId?: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  failureReason?: string;
  createdAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

// Marketing Types
export interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  position: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  userLimit: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableCategories?: string[];
}

// Enums as Types
export type UserRole = 'customer' | 'admin' | 'staff' | 'partner' | 'doctor';
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'packed' 
  | 'shipped' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type RequestStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type NotificationType = 'order' | 'booking' | 'payment' | 'offer' | 'general';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
