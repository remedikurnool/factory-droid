'use client'

import { useState, useEffect, useRef } from 'react'
import { userAPI } from '@/lib/api/user'
import type {
  UserProfile,
  Address,
  Prescription,
  WalletTransaction,
  LoyaltyTransaction,
  Notification,
  FamilyMember,
  PaymentMethod,
  BMICalculation,
  WHRCalculation,
  NotificationPreferences,
  PrivacySettings,
  ReferralDetails,
} from '@/lib/types/user'
import {
  User,
  MapPin,
  FileText,
  Wallet,
  Award,
  Bell,
  Users,
  CreditCard,
  Calculator,
  Settings,
  Camera,
  Lock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Share2,
  Copy,
  LogOut,
  Globe,
  Shield,
  AlertTriangle,
} from 'lucide-react'

type Tab =
  | 'profile'
  | 'addresses'
  | 'prescriptions'
  | 'wallet'
  | 'loyalty'
  | 'notifications'
  | 'family'
  | 'payments'
  | 'health'
  | 'settings'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load profile data
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getProfile()
      setProfile(data)
    } catch (err) {
      setError('Failed to load profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
    { id: 'prescriptions' as Tab, label: 'Prescriptions', icon: FileText },
    { id: 'wallet' as Tab, label: 'Wallet', icon: Wallet },
    { id: 'loyalty' as Tab, label: 'Loyalty', icon: Award },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'family' as Tab, label: 'Family', icon: Users },
    { id: 'payments' as Tab, label: 'Payments', icon: CreditCard },
    { id: 'health' as Tab, label: 'Health', icon: Calculator },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load profile'}</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={profile.profilePicture || '/default-avatar.png'}
                  alt={profile.firstName}
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-gray-600">{profile.email}</p>
                <p className="text-gray-600">{profile.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">₹{profile.walletBalance}</div>
                <div className="text-sm text-gray-600">Wallet Balance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{profile.loyaltyPoints}</div>
                <div className="text-sm text-gray-600">Loyalty Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && <ProfileTab profile={profile} onUpdate={loadProfile} />}
            {activeTab === 'addresses' && <AddressesTab />}
            {activeTab === 'prescriptions' && <PrescriptionsTab />}
            {activeTab === 'wallet' && <WalletTab profile={profile} />}
            {activeTab === 'loyalty' && <LoyaltyTab profile={profile} />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'family' && <FamilyTab />}
            {activeTab === 'payments' && <PaymentsTab />}
            {activeTab === 'health' && <HealthTab profile={profile} />}
            {activeTab === 'settings' && <SettingsTab profile={profile} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ Profile Tab ============
function ProfileTab({ profile, onUpdate }: { profile: UserProfile; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth || '',
    gender: profile.gender || '',
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpdate = async () => {
    try {
      await userAPI.updateProfile(formData)
      setEditing(false)
      onUpdate()
      alert('Profile updated successfully')
    } catch (err) {
      alert('Failed to update profile')
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    try {
      await userAPI.changePassword(passwordData)
      setChangingPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('Password changed successfully')
    } catch (err) {
      alert('Failed to change password')
    }
  }

  const handleUploadPicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      await userAPI.uploadProfilePicture(file)
      onUpdate()
      alert('Profile picture updated successfully')
    } catch (err) {
      alert('Failed to upload profile picture')
    } finally {
      setUploading(false)
    }
  }

  const handleVerify = async (type: 'EMAIL' | 'PHONE') => {
    try {
      await userAPI.sendVerification({ type })
      const otp = prompt(`Enter OTP sent to your ${type.toLowerCase()}:`)
      if (otp) {
        await userAPI.verify({ type, otp })
        onUpdate()
        alert(`${type} verified successfully`)
      }
    } catch (err) {
      alert(`Failed to verify ${type.toLowerCase()}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-4">
          <img
            src={profile.profilePicture || '/default-avatar.png'}
            alt={profile.firstName}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadPicture}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Camera className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Change Picture'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">
                {profile.firstName} {profile.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date of Birth:</span>
              <span className="font-medium">{profile.dateOfBirth || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gender:</span>
              <span className="font-medium">{profile.gender || 'Not set'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Verification Status */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Verification Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">Email:</span>
              <span className="text-gray-900">{profile.email}</span>
              {profile.emailVerified ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            {!profile.emailVerified && (
              <button
                onClick={() => handleVerify('EMAIL')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Verify
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">Phone:</span>
              <span className="text-gray-900">{profile.phoneNumber}</span>
              {profile.phoneVerified ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            {!profile.phoneVerified && (
              <button
                onClick={() => handleVerify('PHONE')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Verify
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Password</h3>
          {!changingPassword && (
            <button
              onClick={() => setChangingPassword(true)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          )}
        </div>

        {changingPassword && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Password
              </button>
              <button
                onClick={() => setChangingPassword(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============ Addresses Tab ============
function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
    label: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    phoneNumber: '',
    isDefault: false,
  })

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getAddresses()
      setAddresses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await userAPI.updateAddress(editingId, formData)
      } else {
        await userAPI.createAddress(formData)
      }
      setShowForm(false)
      setEditingId(null)
      resetForm()
      loadAddresses()
    } catch (err) {
      alert('Failed to save address')
    }
  }

  const handleEdit = (address: Address) => {
    setEditingId(address.id)
    setFormData({
      type: address.type,
      label: address.label || '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      phoneNumber: address.phoneNumber || '',
      isDefault: address.isDefault,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    try {
      await userAPI.deleteAddress(id)
      loadAddresses()
    } catch (err) {
      alert('Failed to delete address')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await userAPI.setDefaultAddress(id)
      loadAddresses()
    } catch (err) {
      alert('Failed to set default address')
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'HOME',
      label: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      phoneNumber: '',
      isDefault: false,
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading addresses...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Addresses</h3>
        <button
          onClick={() => {
            resetForm()
            setEditingId(null)
            setShowForm(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h4 className="font-semibold">{editingId ? 'Edit Address' : 'Add New Address'}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'HOME' | 'WORK' | 'OTHER' })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="HOME">Home</option>
                <option value="WORK">Work</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label (Optional)
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Main Office"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input
              type="text"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Set as default address</span>
            </label>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingId ? 'Update Address' : 'Save Address'}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                resetForm()
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {addresses.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No addresses saved yet</p>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {address.type}
                    </span>
                    {address.label && (
                      <span className="text-sm text-gray-600">({address.label})</span>
                    )}
                    {address.isDefault && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900">{address.addressLine1}</p>
                  {address.addressLine2 && <p className="text-gray-900">{address.addressLine2}</p>}
                  {address.landmark && <p className="text-gray-600">Landmark: {address.landmark}</p>}
                  <p className="text-gray-900">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  {address.phoneNumber && <p className="text-gray-600">Phone: {address.phoneNumber}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ============ Prescriptions Tab ============
function PrescriptionsTab() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPrescriptions()
  }, [])

  const loadPrescriptions = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getPrescriptions()
      setPrescriptions(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      await userAPI.uploadPrescription(file)
      loadPrescriptions()
      alert('Prescription uploaded successfully')
    } catch (err) {
      alert('Failed to upload prescription')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prescription?')) return
    try {
      await userAPI.deletePrescription(id)
      loadPrescriptions()
    } catch (err) {
      alert('Failed to delete prescription')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading prescriptions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Prescriptions</h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Prescription'}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {prescriptions.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No prescriptions uploaded yet</p>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{prescription.fileName}</p>
                    <p className="text-sm text-gray-600">
                      Uploaded: {new Date(prescription.uploadedAt).toLocaleDateString()}
                    </p>
                    {prescription.doctorName && (
                      <p className="text-sm text-gray-600">Doctor: {prescription.doctorName}</p>
                    )}
                    {prescription.linkedOrders.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Linked to {prescription.linkedOrders.length} order(s)
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={prescription.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(prescription.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ============ Wallet Tab ============
function WalletTab({ profile }: { profile: UserProfile }) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showRecharge, setShowRecharge] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState('')

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getWalletTransactions({ limit: 20 })
      setTransactions(data.transactions)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount)
    if (!amount || amount < 100) {
      alert('Minimum recharge amount is ₹100')
      return
    }

    try {
      await userAPI.rechargeWallet({ amount, paymentMethod: 'RAZORPAY' })
      setShowRecharge(false)
      setRechargeAmount('')
      loadTransactions()
      alert('Wallet recharged successfully')
    } catch (err) {
      alert('Failed to recharge wallet')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h3 className="text-lg font-medium mb-2">Wallet Balance</h3>
        <p className="text-4xl font-bold">₹{profile.walletBalance.toFixed(2)}</p>
        <button
          onClick={() => setShowRecharge(true)}
          className="mt-4 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100"
        >
          Recharge Wallet
        </button>
      </div>

      {showRecharge && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h4 className="font-semibold">Recharge Wallet</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              min="100"
              step="100"
              placeholder="Enter amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleRecharge}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Proceed to Pay
            </button>
            <button
              onClick={() => setShowRecharge(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        {loading ? (
          <p className="text-center text-gray-600 py-8">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                  {transaction.referenceType && (
                    <span className="text-xs text-gray-500">{transaction.referenceType}</span>
                  )}
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'CREDIT' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Balance: ₹{transaction.balance.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ Loyalty Tab ============
function LoyaltyTab({ profile }: { profile: UserProfile }) {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [referralDetails, setReferralDetails] = useState<ReferralDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [txData, refData] = await Promise.all([
        userAPI.getLoyaltyTransactions({ limit: 20 }),
        userAPI.getReferralDetails(),
      ])
      setTransactions(txData.transactions)
      setReferralDetails(refData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = () => {
    if (referralDetails) {
      navigator.clipboard.writeText(referralDetails.referralCode)
      alert('Referral code copied!')
    }
  }

  const copyReferralLink = () => {
    if (referralDetails) {
      navigator.clipboard.writeText(referralDetails.referralLink)
      alert('Referral link copied!')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h3 className="text-lg font-medium mb-2">Loyalty Points</h3>
        <p className="text-4xl font-bold">{profile.loyaltyPoints}</p>
        <p className="text-sm mt-2">1 point = ₹1</p>
      </div>

      {referralDetails && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Referral Program</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {referralDetails.totalReferrals}
              </div>
              <div className="text-sm text-gray-600">Total Referrals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {referralDetails.successfulReferrals}
              </div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {referralDetails.totalPointsEarned}
              </div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Referral Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={referralDetails.referralCode}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={copyReferralCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Link
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={referralDetails.referralLink}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={copyReferralLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Points History</h3>
        {loading ? (
          <p className="text-center text-gray-600 py-8">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No loyalty transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                  {transaction.referenceType && (
                    <span className="text-xs text-gray-500">{transaction.referenceType}</span>
                  )}
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === 'EARNED' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'EARNED' ? '+' : '-'}
                    {transaction.points} pts
                  </p>
                  <p className="text-sm text-gray-600">Balance: {transaction.balance} pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ Notifications Tab ============
function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPreferences, setShowPreferences] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [notifData, prefData] = await Promise.all([
        userAPI.getNotifications({ limit: 20 }),
        userAPI.getNotificationPreferences(),
      ])
      setNotifications(notifData.notifications)
      setPreferences(prefData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await userAPI.markNotificationAsRead(id)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await userAPI.markAllNotificationsAsRead()
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await userAPI.deleteNotification(id)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdatePreferences = async () => {
    if (!preferences) return
    try {
      await userAPI.updateNotificationPreferences(preferences)
      setShowPreferences(false)
      alert('Preferences updated successfully')
    } catch (err) {
      alert('Failed to update preferences')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Mark All as Read
          </button>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {showPreferences && preferences && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h4 className="font-semibold">Notification Preferences</h4>

          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">Email Notifications</h5>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.email.enabled}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        email: { ...preferences.email, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Enable email notifications</span>
                </label>
                <label className="flex items-center space-x-2 ml-6">
                  <input
                    type="checkbox"
                    checked={preferences.email.orderUpdates}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        email: { ...preferences.email, orderUpdates: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Order updates</span>
                </label>
                <label className="flex items-center space-x-2 ml-6">
                  <input
                    type="checkbox"
                    checked={preferences.email.promotions}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        email: { ...preferences.email, promotions: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Promotions</span>
                </label>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">SMS Notifications</h5>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.sms.enabled}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        sms: { ...preferences.sms, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Enable SMS notifications</span>
                </label>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">WhatsApp Notifications</h5>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.whatsapp.enabled}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        whatsapp: { ...preferences.whatsapp, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Enable WhatsApp notifications</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleUpdatePreferences}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Preferences
            </button>
            <button
              onClick={() => setShowPreferences(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div>
        {loading ? (
          <p className="text-center text-gray-600 py-8">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No notifications</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg ${
                  notification.isRead
                    ? 'bg-white border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">
                        {notification.type}
                      </span>
                      {notification.priority === 'HIGH' || notification.priority === 'URGENT' ? (
                        <span className="text-xs font-medium text-red-600">
                          {notification.priority}
                        </span>
                      ) : null}
                    </div>
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ Family Tab ============
function FamilyTab() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'SPOUSE',
    dateOfBirth: '',
    gender: '' as 'MALE' | 'FEMALE' | 'OTHER' | '',
    phoneNumber: '',
    bloodGroup: '',
  })

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getFamilyMembers()
      setMembers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await userAPI.updateFamilyMember(editingId, formData)
      } else {
        await userAPI.addFamilyMember(formData)
      }
      setShowForm(false)
      setEditingId(null)
      resetForm()
      loadMembers()
    } catch (err) {
      alert('Failed to save family member')
    }
  }

  const handleEdit = (member: FamilyMember) => {
    setEditingId(member.id)
    setFormData({
      name: member.name,
      relationship: member.relationship,
      dateOfBirth: member.dateOfBirth || '',
      gender: member.gender || '',
      phoneNumber: member.phoneNumber || '',
      bloodGroup: member.bloodGroup || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) return
    try {
      await userAPI.deleteFamilyMember(id)
      loadMembers()
    } catch (err) {
      alert('Failed to delete family member')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: 'SPOUSE',
      dateOfBirth: '',
      gender: '',
      phoneNumber: '',
      bloodGroup: '',
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading family members...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Family Members</h3>
        <button
          onClick={() => {
            resetForm()
            setEditingId(null)
            setShowForm(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h4 className="font-semibold">{editingId ? 'Edit Member' : 'Add Family Member'}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship *
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="SPOUSE">Spouse</option>
                <option value="SON">Son</option>
                <option value="DAUGHTER">Daughter</option>
                <option value="FATHER">Father</option>
                <option value="MOTHER">Mother</option>
                <option value="BROTHER">Brother</option>
                <option value="SISTER">Sister</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <input
                type="text"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                placeholder="e.g., A+"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingId ? 'Update Member' : 'Add Member'}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                resetForm()
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {members.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No family members added yet</p>
        ) : (
          members.map((member) => (
            <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.relationship}</p>
                    {member.dateOfBirth && (
                      <p className="text-sm text-gray-600">
                        DOB: {new Date(member.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}
                    {member.bloodGroup && (
                      <p className="text-sm text-gray-600">Blood Group: {member.bloodGroup}</p>
                    )}
                    {member.phoneNumber && (
                      <p className="text-sm text-gray-600">Phone: {member.phoneNumber}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ============ Payments Tab ============
function PaymentsTab() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getPaymentMethods()
      setPaymentMethods(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return
    try {
      await userAPI.deletePaymentMethod(id)
      loadPaymentMethods()
    } catch (err) {
      alert('Failed to delete payment method')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await userAPI.setDefaultPaymentMethod(id)
      loadPaymentMethods()
    } catch (err) {
      alert('Failed to set default payment method')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading payment methods...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Payment Methods</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Add Payment Method</span>
        </button>
      </div>

      <div className="grid gap-4">
        {paymentMethods.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No payment methods saved</p>
        ) : (
          paymentMethods.map((method) => (
            <div key={method.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{method.type}</h4>
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Default
                        </span>
                      )}
                      {method.isVerified && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    {method.type === 'CARD' && method.cardNumber && (
                      <p className="text-sm text-gray-600">
                        {method.cardType} •••• {method.cardNumber}
                      </p>
                    )}
                    {method.type === 'UPI' && method.upiId && (
                      <p className="text-sm text-gray-600">{method.upiId}</p>
                    )}
                    {method.type === 'NETBANKING' && method.bankName && (
                      <p className="text-sm text-gray-600">{method.bankName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ============ Health Tab ============
function HealthTab({ profile }: { profile: UserProfile }) {
  const [activeCalculator, setActiveCalculator] = useState<'bmi' | 'whr'>('bmi')
  const [bmiData, setBmiData] = useState({ height: '', weight: '' })
  const [whrData, setWhrData] = useState({ waist: '', hip: '', gender: profile.gender || 'MALE' })
  const [bmiResult, setBmiResult] = useState<BMICalculation | null>(null)
  const [whrResult, setWhrResult] = useState<WHRCalculation | null>(null)

  const handleCalculateBMI = async () => {
    const height = parseFloat(bmiData.height)
    const weight = parseFloat(bmiData.weight)

    if (!height || !weight) {
      alert('Please enter valid height and weight')
      return
    }

    try {
      const result = await userAPI.calculateBMI(height, weight)
      setBmiResult(result)
    } catch (err) {
      alert('Failed to calculate BMI')
    }
  }

  const handleCalculateWHR = async () => {
    const waist = parseFloat(whrData.waist)
    const hip = parseFloat(whrData.hip)

    if (!waist || !hip) {
      alert('Please enter valid measurements')
      return
    }

    try {
      const result = await userAPI.calculateWHR(
        waist,
        hip,
        whrData.gender as 'MALE' | 'FEMALE'
      )
      setWhrResult(result)
    } catch (err) {
      alert('Failed to calculate WHR')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setActiveCalculator('bmi')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeCalculator === 'bmi'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          BMI Calculator
        </button>
        <button
          onClick={() => setActiveCalculator('whr')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeCalculator === 'whr'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          WHR Calculator
        </button>
      </div>

      {activeCalculator === 'bmi' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">BMI Calculator</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={bmiData.height}
                  onChange={(e) => setBmiData({ ...bmiData, height: e.target.value })}
                  placeholder="170"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={bmiData.weight}
                  onChange={(e) => setBmiData({ ...bmiData, weight: e.target.value })}
                  placeholder="70"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleCalculateBMI}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Calculate BMI
            </button>
          </div>

          {bmiResult && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Results</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Your BMI</p>
                  <p className="text-3xl font-bold text-blue-600">{bmiResult.bmi.toFixed(1)}</p>
                  <p className="text-sm font-medium text-gray-900">{bmiResult.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ideal Weight Range</p>
                  <p className="font-medium">
                    {bmiResult.idealWeightRange.min} - {bmiResult.idealWeightRange.max} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Recommendations</p>
                  <ul className="list-disc list-inside space-y-1">
                    {bmiResult.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeCalculator === 'whr' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">WHR Calculator</h3>
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waist (cm)
                  </label>
                  <input
                    type="number"
                    value={whrData.waist}
                    onChange={(e) => setWhrData({ ...whrData, waist: e.target.value })}
                    placeholder="80"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hip (cm)</label>
                  <input
                    type="number"
                    value={whrData.hip}
                    onChange={(e) => setWhrData({ ...whrData, hip: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={whrData.gender}
                  onChange={(e) => setWhrData({ ...whrData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleCalculateWHR}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Calculate WHR
            </button>
          </div>

          {whrResult && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Results</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Your WHR</p>
                  <p className="text-3xl font-bold text-blue-600">{whrResult.whr.toFixed(2)}</p>
                  <p className="text-sm font-medium text-gray-900">{whrResult.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Recommendations</p>
                  <ul className="list-disc list-inside space-y-1">
                    {whrResult.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============ Settings Tab ============
function SettingsTab({ profile }: { profile: UserProfile }) {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState(profile.languagePreference)

  useEffect(() => {
    loadPrivacySettings()
  }, [])

  const loadPrivacySettings = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getPrivacySettings()
      setPrivacySettings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLanguage = async () => {
    try {
      await userAPI.updateProfile({ languagePreference: language })
      alert('Language updated successfully')
    } catch (err) {
      alert('Failed to update language')
    }
  }

  const handleUpdatePrivacy = async () => {
    if (!privacySettings) return
    try {
      await userAPI.updatePrivacySettings(privacySettings)
      alert('Privacy settings updated successfully')
    } catch (err) {
      alert('Failed to update privacy settings')
    }
  }

  const handleDeleteAccount = async () => {
    const password = prompt('Enter your password to confirm account deletion:')
    if (!password) return

    const reason = prompt('Please tell us why you want to delete your account (optional):')

    if (
      !confirm(
        'Are you absolutely sure? This action cannot be undone and all your data will be permanently deleted.'
      )
    )
      return

    try {
      await userAPI.deleteAccount({ password, reason: reason || undefined })
      alert('Your account has been scheduled for deletion. You will be logged out.')
      // Redirect to logout/home
      window.location.href = '/logout'
    } catch (err) {
      alert('Failed to delete account. Please check your password.')
    }
  }

  const handleExportData = async () => {
    try {
      const blob = await userAPI.exportUserData()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `user-data-${new Date().toISOString()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert('Failed to export data')
    }
  }

  return (
    <div className="space-y-6">
      {/* Language Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Language Preference</h3>
        </div>
        <div className="space-y-4">
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as 'ENGLISH' | 'TELUGU' | 'HINDI')
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ENGLISH">English</option>
            <option value="TELUGU">Telugu (తెలుగు)</option>
            <option value="HINDI">Hindi (हिन्दी)</option>
          </select>
          <button
            onClick={handleUpdateLanguage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Update Language
          </button>
        </div>
      </div>

      {/* Privacy Settings */}
      {!loading && privacySettings && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Privacy Settings</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Profile Visibility</span>
              <select
                value={privacySettings.profileVisibility}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    profileVisibility: e.target.value as 'PUBLIC' | 'PRIVATE',
                  })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Show email on profile</span>
              <input
                type="checkbox"
                checked={privacySettings.showEmail}
                onChange={(e) =>
                  setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Show phone on profile</span>
              <input
                type="checkbox"
                checked={privacySettings.showPhone}
                onChange={(e) =>
                  setPrivacySettings({ ...privacySettings, showPhone: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Allow marketing emails</span>
              <input
                type="checkbox"
                checked={privacySettings.allowMarketingEmails}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    allowMarketingEmails: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Allow marketing SMS</span>
              <input
                type="checkbox"
                checked={privacySettings.allowMarketingSMS}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    allowMarketingSMS: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Allow data sharing with partners</span>
              <input
                type="checkbox"
                checked={privacySettings.allowDataSharing}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    allowDataSharing: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
          </div>
          <button
            onClick={handleUpdatePrivacy}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Privacy Settings
          </button>
        </div>
      )}

      {/* Data Export */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Download className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Export Your Data</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Download all your personal data in JSON format
        </p>
        <button
          onClick={handleExportData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Export Data
        </button>
      </div>

      {/* Delete Account */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Delete Account</h3>
        </div>
        <p className="text-red-700 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Delete My Account
        </button>
      </div>
    </div>
  )
}
