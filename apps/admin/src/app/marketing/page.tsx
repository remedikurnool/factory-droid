'use client'

import { useState, useEffect } from 'react'
import { marketingAPI } from '@/lib/api/marketing'
import type {
  Banner,
  Coupon,
  Notification,
  BannerStats,
  CouponStats,
  NotificationStats,
  CreateBannerRequest,
  CreateCouponRequest,
  CreateNotificationRequest,
  BannerLinkType,
  DiscountType,
  ApplicableType,
  CouponUserType,
  NotificationType,
  NotificationTargetType,
  UserSegment,
} from '@/lib/types/marketing'
import {
  Image as ImageIcon,
  Tag,
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  Users,
  BarChart3,
  Upload,
  X,
  Check,
  Calendar,
  Link as LinkIcon,
  Send,
  Copy,
} from 'lucide-react'
import { format } from 'date-fns'

type TabType = 'banners' | 'coupons' | 'notifications'

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('banners')
  const [loading, setLoading] = useState(true)

  // Stats
  const [bannerStats, setBannerStats] = useState<BannerStats | null>(null)
  const [couponStats, setCouponStats] = useState<CouponStats | null>(null)
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null)

  // Data
  const [banners, setBanners] = useState<Banner[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Modals
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)

  // Form states
  const [bannerForm, setBannerForm] = useState<Partial<CreateBannerRequest>>({
    linkType: BannerLinkType.NONE,
    displayOrder: 0,
    isActive: true,
  })
  const [couponForm, setCouponForm] = useState<Partial<CreateCouponRequest>>({
    discountType: DiscountType.PERCENTAGE,
    applicableType: ApplicableType.ALL,
    applicableIds: [],
    userType: CouponUserType.ALL,
    specificUserIds: [],
    isActive: true,
  })
  const [notificationForm, setNotificationForm] = useState<Partial<CreateNotificationRequest>>({
    type: NotificationType.PUSH,
    targetType: NotificationTargetType.ALL_USERS,
    targetUserIds: [],
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'banners') {
        const [stats, data] = await Promise.all([
          marketingAPI.banners.getBannerStats(),
          marketingAPI.banners.getBanners({ page: 1, pageSize: 50 }),
        ])
        setBannerStats(stats)
        setBanners(data.data)
      } else if (activeTab === 'coupons') {
        const [stats, data] = await Promise.all([
          marketingAPI.coupons.getCouponStats(),
          marketingAPI.coupons.getCoupons({ page: 1, pageSize: 50 }),
        ])
        setCouponStats(stats)
        setCoupons(data.data)
      } else if (activeTab === 'notifications') {
        const [stats, data] = await Promise.all([
          marketingAPI.notifications.getNotificationStats(),
          marketingAPI.notifications.getNotifications({ page: 1, pageSize: 50 }),
        ])
        setNotificationStats(stats)
        setNotifications(data.data)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBanner = async () => {
    try {
      await marketingAPI.banners.createBanner(bannerForm as CreateBannerRequest)
      setShowBannerModal(false)
      setBannerForm({ linkType: BannerLinkType.NONE, displayOrder: 0, isActive: true })
      loadData()
    } catch (error) {
      console.error('Failed to create banner:', error)
      alert('Failed to create banner')
    }
  }

  const handleCreateCoupon = async () => {
    try {
      await marketingAPI.coupons.createCoupon(couponForm as CreateCouponRequest)
      setShowCouponModal(false)
      setCouponForm({
        discountType: DiscountType.PERCENTAGE,
        applicableType: ApplicableType.ALL,
        applicableIds: [],
        userType: CouponUserType.ALL,
        specificUserIds: [],
        isActive: true,
      })
      loadData()
    } catch (error) {
      console.error('Failed to create coupon:', error)
      alert('Failed to create coupon')
    }
  }

  const handleCreateNotification = async () => {
    try {
      await marketingAPI.notifications.createNotification(notificationForm as CreateNotificationRequest)
      setShowNotificationModal(false)
      setNotificationForm({
        type: NotificationType.PUSH,
        targetType: NotificationTargetType.ALL_USERS,
        targetUserIds: [],
      })
      loadData()
    } catch (error) {
      console.error('Failed to create notification:', error)
      alert('Failed to create notification')
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    try {
      await marketingAPI.banners.deleteBanner(id)
      loadData()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    try {
      await marketingAPI.coupons.deleteCoupon(id)
      loadData()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleSendNotification = async (id: string) => {
    if (!confirm('Send this notification now?')) return
    try {
      await marketingAPI.notifications.sendNotification(id)
      loadData()
    } catch (error) {
      console.error('Failed to send:', error)
    }
  }

  const handleGenerateCode = async () => {
    try {
      const { code } = await marketingAPI.coupons.generateCode()
      setCouponForm({ ...couponForm, code })
    } catch (error) {
      console.error('Failed to generate code:', error)
    }
  }

  if (loading && (banners.length === 0 && coupons.length === 0 && notifications.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketing tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Tools</h1>
          <p className="text-gray-600 mt-1">Manage banners, coupons, and notifications</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('banners')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'banners'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span>Banners</span>
              </button>
              <button
                onClick={() => setActiveTab('coupons')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'coupons'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Tag className="w-5 h-5" />
                <span>Coupons</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
            </nav>
          </div>

          {/* Stats Cards */}
          {activeTab === 'banners' && bannerStats && (
            <div className="grid grid-cols-5 gap-4 p-6 border-b border-gray-200">
              <StatsCard title="Total Banners" value={bannerStats.totalBanners} icon={ImageIcon} color="blue" />
              <StatsCard title="Active" value={bannerStats.activeBanners} icon={Check} color="green" />
              <StatsCard title="Total Clicks" value={bannerStats.totalClicks.toLocaleString()} icon={TrendingUp} color="purple" />
              <StatsCard title="Impressions" value={bannerStats.totalImpressions.toLocaleString()} icon={Eye} color="indigo" />
              <StatsCard title="Avg CTR" value={`${bannerStats.averageCTR.toFixed(2)}%`} icon={BarChart3} color="orange" />
            </div>
          )}

          {activeTab === 'coupons' && couponStats && (
            <div className="grid grid-cols-5 gap-4 p-6 border-b border-gray-200">
              <StatsCard title="Total Coupons" value={couponStats.totalCoupons} icon={Tag} color="blue" />
              <StatsCard title="Active" value={couponStats.activeCoupons} icon={Check} color="green" />
              <StatsCard title="Total Usage" value={couponStats.totalUsage.toLocaleString()} icon={Users} color="purple" />
              <StatsCard title="Revenue" value={`₹${(couponStats.totalRevenue / 1000).toFixed(0)}K`} icon={TrendingUp} color="indigo" />
              <StatsCard title="Discount Given" value={`₹${(couponStats.totalDiscount / 1000).toFixed(0)}K`} icon={BarChart3} color="orange" />
            </div>
          )}

          {activeTab === 'notifications' && notificationStats && (
            <div className="grid grid-cols-5 gap-4 p-6 border-b border-gray-200">
              <StatsCard title="Total Sent" value={notificationStats.sentCount} icon={Bell} color="blue" />
              <StatsCard title="Scheduled" value={notificationStats.scheduledCount} icon={Calendar} color="purple" />
              <StatsCard title="Delivered" value={notificationStats.totalDelivered.toLocaleString()} icon={Check} color="green" />
              <StatsCard title="Open Rate" value={`${notificationStats.averageOpenRate.toFixed(1)}%`} icon={Eye} color="indigo" />
              <StatsCard title="Click Rate" value={`${notificationStats.averageClickRate.toFixed(1)}%`} icon={TrendingUp} color="orange" />
            </div>
          )}

          {/* Action Button */}
          <div className="p-6">
            {activeTab === 'banners' && (
              <button
                onClick={() => setShowBannerModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Create Banner</span>
              </button>
            )}
            {activeTab === 'coupons' && (
              <button
                onClick={() => setShowCouponModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            )}
            {activeTab === 'notifications' && (
              <button
                onClick={() => setShowNotificationModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Create Notification</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'banners' && (
          <div className="grid grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded">Inactive</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                  {banner.description && <p className="text-sm text-gray-600 mt-1">{banner.description}</p>}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-600">Clicks:</span>{' '}
                      <span className="font-medium text-gray-900">{banner.clicks}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">CTR:</span>{' '}
                      <span className="font-medium text-gray-900">{banner.ctr.toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="px-2 py-1 bg-gray-100 rounded font-mono text-sm">{coupon.code}</code>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {coupon.discountType === DiscountType.PERCENTAGE
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {coupon.usageCount} / {coupon.usageLimit || '∞'}
                    </td>
                    <td className="px-6 py-4 text-sm">{format(new Date(coupon.endDate), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metrics</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message.substring(0, 50)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{notification.type}</td>
                    <td className="px-6 py-4 text-sm">{notification.totalUsers} users</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          notification.status === 'SENT'
                            ? 'bg-green-100 text-green-700'
                            : notification.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {notification.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        <div>Open: {notification.openRate.toFixed(1)}%</div>
                        <div>Click: {notification.clickRate.toFixed(1)}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {notification.status === 'DRAFT' && (
                        <button
                          onClick={() => handleSendNotification(notification.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Banner Modal */}
      {showBannerModal && (
        <Modal onClose={() => setShowBannerModal(false)} title="Create Banner">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Banner Title"
              value={bannerForm.title || ''}
              onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={bannerForm.imageUrl || ''}
              onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <select
              value={bannerForm.linkType}
              onChange={(e) => setBannerForm({ ...bannerForm, linkType: e.target.value as BannerLinkType })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value={BannerLinkType.NONE}>No Link</option>
              <option value={BannerLinkType.PRODUCT}>Product</option>
              <option value={BannerLinkType.CATEGORY}>Category</option>
              <option value={BannerLinkType.EXTERNAL_URL}>External URL</option>
            </select>
            {bannerForm.linkType !== BannerLinkType.NONE && (
              <input
                type="text"
                placeholder="Link Value (ID or URL)"
                value={bannerForm.linkValue || ''}
                onChange={(e) => setBannerForm({ ...bannerForm, linkValue: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            )}
            <button
              onClick={handleCreateBanner}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Banner
            </button>
          </div>
        </Modal>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <Modal onClose={() => setShowCouponModal(false)} title="Create Coupon">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Coupon Code"
                value={couponForm.code || ''}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button onClick={handleGenerateCode} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                Generate
              </button>
            </div>
            <input
              type="text"
              placeholder="Coupon Name"
              value={couponForm.name || ''}
              onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={couponForm.discountType}
                onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as DiscountType })}
                className="px-4 py-2 border rounded-lg"
              >
                <option value={DiscountType.PERCENTAGE}>Percentage</option>
                <option value={DiscountType.FLAT}>Flat Amount</option>
              </select>
              <input
                type="number"
                placeholder="Discount Value"
                value={couponForm.discountValue || ''}
                onChange={(e) => setCouponForm({ ...couponForm, discountValue: parseFloat(e.target.value) })}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                placeholder="Start Date"
                value={couponForm.startDate || ''}
                onChange={(e) => setCouponForm({ ...couponForm, startDate: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="date"
                placeholder="End Date"
                value={couponForm.endDate || ''}
                onChange={(e) => setCouponForm({ ...couponForm, endDate: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
            <button
              onClick={handleCreateCoupon}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Coupon
            </button>
          </div>
        </Modal>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <Modal onClose={() => setShowNotificationModal(false)} title="Create Notification">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Notification Title"
              value={notificationForm.title || ''}
              onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <textarea
              placeholder="Message"
              value={notificationForm.message || ''}
              onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
            />
            <select
              value={notificationForm.type}
              onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value as NotificationType })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value={NotificationType.PUSH}>Push Notification</option>
              <option value={NotificationType.SMS}>SMS</option>
              <option value={NotificationType.EMAIL}>Email</option>
            </select>
            <select
              value={notificationForm.targetType}
              onChange={(e) =>
                setNotificationForm({ ...notificationForm, targetType: e.target.value as NotificationTargetType })
              }
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value={NotificationTargetType.ALL_USERS}>All Users</option>
              <option value={NotificationTargetType.SEGMENT}>Segment</option>
            </select>
            <button
              onClick={handleCreateNotification}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Notification
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  icon: any
  color: string
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <div className={`w-10 h-10 rounded-lg ${colors[color as keyof typeof colors]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
