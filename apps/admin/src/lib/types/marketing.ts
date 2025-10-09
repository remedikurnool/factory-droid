/**
 * Marketing Tools Types
 * Types for banners, offers, coupons, and notifications
 */

// ============ Banner Types ============

export interface Banner {
  id: string
  title: string
  description?: string
  imageUrl: string
  mobileImageUrl?: string
  linkType: BannerLinkType
  linkValue: string // URL, product ID, or category ID
  displayOrder: number
  isActive: boolean
  startDate?: string
  endDate?: string
  clicks: number
  impressions: number
  ctr: number // Click-through rate
  createdAt: string
  updatedAt: string
}

export enum BannerLinkType {
  NONE = 'NONE',
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  EXTERNAL_URL = 'EXTERNAL_URL',
  CUSTOM_PAGE = 'CUSTOM_PAGE',
}

export interface CreateBannerRequest {
  title: string
  description?: string
  imageUrl: string
  mobileImageUrl?: string
  linkType: BannerLinkType
  linkValue: string
  displayOrder: number
  isActive: boolean
  startDate?: string
  endDate?: string
}

export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {
  id: string
}

export interface ReorderBannersRequest {
  bannerIds: string[]
}

export interface BannerStats {
  totalBanners: number
  activeBanners: number
  totalClicks: number
  totalImpressions: number
  averageCTR: number
}

// ============ Offer Types ============

export interface Offer {
  id: string
  name: string
  description: string
  offerType: OfferType
  discountType: DiscountType
  discountValue: number // Percentage or flat amount
  maxDiscount?: number // For percentage discounts
  minCartValue?: number
  applicableType: ApplicableType
  applicableIds: string[] // Product or category IDs
  startDate: string
  endDate: string
  usageLimit?: number
  usageLimitPerCustomer?: number
  usageCount: number
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

export enum OfferType {
  PERCENTAGE_OFF = 'PERCENTAGE_OFF',
  FLAT_DISCOUNT = 'FLAT_DISCOUNT',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  FREE_SHIPPING = 'FREE_SHIPPING',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

export enum ApplicableType {
  ALL = 'ALL',
  CATEGORIES = 'CATEGORIES',
  PRODUCTS = 'PRODUCTS',
}

export interface CreateOfferRequest {
  name: string
  description: string
  offerType: OfferType
  discountType: DiscountType
  discountValue: number
  maxDiscount?: number
  minCartValue?: number
  applicableType: ApplicableType
  applicableIds: string[]
  startDate: string
  endDate: string
  usageLimit?: number
  usageLimitPerCustomer?: number
  isActive: boolean
  priority: number
}

export interface UpdateOfferRequest extends Partial<CreateOfferRequest> {
  id: string
}

export interface OfferStats {
  totalOffers: number
  activeOffers: number
  totalUsage: number
  totalRevenue: number
  totalDiscount: number
}

// ============ Coupon Types ============

export interface Coupon {
  id: string
  code: string
  name: string
  description?: string
  discountType: DiscountType
  discountValue: number
  maxDiscount?: number
  minOrderValue?: number
  applicableType: ApplicableType
  applicableIds: string[]
  startDate: string
  endDate: string
  usageLimit?: number
  usageLimitPerCustomer?: number
  usageCount: number
  userType: CouponUserType
  specificUserIds: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Analytics
  totalRevenue: number
  totalDiscount: number
  averageOrderValue: number
}

export enum CouponUserType {
  ALL = 'ALL',
  NEW_USERS = 'NEW_USERS',
  EXISTING_USERS = 'EXISTING_USERS',
  SPECIFIC_USERS = 'SPECIFIC_USERS',
}

export interface CreateCouponRequest {
  code: string
  name: string
  description?: string
  discountType: DiscountType
  discountValue: number
  maxDiscount?: number
  minOrderValue?: number
  applicableType: ApplicableType
  applicableIds: string[]
  startDate: string
  endDate: string
  usageLimit?: number
  usageLimitPerCustomer?: number
  userType: CouponUserType
  specificUserIds: string[]
  isActive: boolean
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> {
  id: string
}

export interface CouponStats {
  totalCoupons: number
  activeCoupons: number
  totalUsage: number
  totalRevenue: number
  totalDiscount: number
  averageDiscount: number
}

export interface CouponUsageLog {
  id: string
  couponId: string
  couponCode: string
  userId: string
  userName: string
  orderId: string
  orderAmount: number
  discountAmount: number
  usedAt: string
}

// ============ Notification Types ============

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  targetType: NotificationTargetType
  targetUserIds: string[]
  targetSegment?: UserSegment
  scheduledAt?: string
  sentAt?: string
  status: NotificationStatus
  totalUsers: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  failedCount: number
  deliveryRate: number
  openRate: number
  clickRate: number
  imageUrl?: string
  actionUrl?: string
  actionLabel?: string
  createdAt: string
  updatedAt: string
}

export enum NotificationType {
  PUSH = 'PUSH',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
}

export enum NotificationTargetType {
  ALL_USERS = 'ALL_USERS',
  SEGMENT = 'SEGMENT',
  SPECIFIC_USERS = 'SPECIFIC_USERS',
}

export enum NotificationStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum UserSegment {
  ALL = 'ALL',
  NEW_USERS = 'NEW_USERS',
  ACTIVE_USERS = 'ACTIVE_USERS',
  INACTIVE_USERS = 'INACTIVE_USERS',
  HIGH_VALUE = 'HIGH_VALUE',
  CART_ABANDONERS = 'CART_ABANDONERS',
}

export interface CreateNotificationRequest {
  title: string
  message: string
  type: NotificationType
  targetType: NotificationTargetType
  targetUserIds: string[]
  targetSegment?: UserSegment
  scheduledAt?: string
  imageUrl?: string
  actionUrl?: string
  actionLabel?: string
}

export interface UpdateNotificationRequest extends Partial<CreateNotificationRequest> {
  id: string
}

export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  title: string
  message: string
  imageUrl?: string
  actionUrl?: string
  actionLabel?: string
  variables: string[] // e.g., ['userName', 'orderNumber']
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTemplateRequest {
  name: string
  type: NotificationType
  title: string
  message: string
  imageUrl?: string
  actionUrl?: string
  actionLabel?: string
  variables: string[]
  isActive: boolean
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {
  id: string
}

export interface NotificationStats {
  totalNotifications: number
  scheduledCount: number
  sentCount: number
  failedCount: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  averageOpenRate: number
  averageClickRate: number
}

// ============ Marketing Analytics ============

export interface MarketingAnalytics {
  bannerStats: BannerStats
  offerStats: OfferStats
  couponStats: CouponStats
  notificationStats: NotificationStats
  revenueImpact: RevenueImpact
  topPerformingCoupons: Coupon[]
  topPerformingOffers: Offer[]
  topPerformingBanners: Banner[]
}

export interface RevenueImpact {
  totalRevenue: number
  discountGiven: number
  netRevenue: number
  averageOrderValue: number
  conversionRate: number
}

// ============ Common Types ============

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ImageUploadResponse {
  url: string
  thumbnailUrl?: string
}

export interface BulkActionRequest {
  ids: string[]
  action: 'ACTIVATE' | 'DEACTIVATE' | 'DELETE'
}
