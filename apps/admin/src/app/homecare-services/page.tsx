'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { homecareServiceAPI } from '@/lib/api/services'
import type { HomecareService, HomecareServiceFilters, HomecareServiceStats } from '@/lib/types/services'
import { ServiceStatus, ServiceType } from '@/lib/types/services'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  CheckSquare,
  Square,
  Heart,
  Users,
  Clock,
  TrendingUp,
  UserCheck,
} from 'lucide-react'

export default function HomecareServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<HomecareService[]>([])
  const [stats, setStats] = useState<HomecareServiceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<HomecareServiceFilters>({})
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadServices()
    loadStats()
  }, [page, filters])

  const loadServices = async () => {
    try {
      setLoading(true)
      const response = await homecareServiceAPI.getHomecareServices({
        page,
        pageSize,
        filters: { ...filters, search: searchQuery },
      })
      setServices(response.data)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to load homecare services:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await homecareServiceAPI.getHomecareServiceStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadServices()
  }

  const handleFilterChange = (key: keyof HomecareServiceFilters, value: any) => {
    setFilters({ ...filters, [key]: value })
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchQuery('')
    setPage(1)
  }

  const handleSelectAll = () => {
    if (selectedIds.length === services.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(services.map((s) => s.id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkAction = async (action: 'ACTIVATE' | 'DEACTIVATE' | 'DELETE') => {
    if (selectedIds.length === 0) {
      alert('Please select at least one service')
      return
    }
    if (action === 'DELETE' && !confirm(`Are you sure you want to delete ${selectedIds.length} services?`)) {
      return
    }
    try {
      await homecareServiceAPI.bulkActionHomecareServices({ ids: selectedIds, action })
      setSelectedIds([])
      loadServices()
      loadStats()
    } catch (error) {
      console.error('Bulk action failed:', error)
      alert('Failed to perform bulk action')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      await homecareServiceAPI.deleteHomecareService(id)
      loadServices()
      loadStats()
    } catch (error) {
      console.error('Failed to delete service:', error)
      alert('Failed to delete service')
    }
  }

  const handleExport = async (format: 'CSV' | 'EXCEL') => {
    try {
      const response = await homecareServiceAPI.exportHomecareServices({ format, filters })
      window.open(response.url, '_blank')
    } catch (error) {
      console.error('Failed to export:', error)
      alert('Failed to export services')
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const result = await homecareServiceAPI.importHomecareServices(file)
      alert(`Imported ${result.imported} services successfully!`)
      if (result.errors.length > 0) {
        console.error('Import errors:', result.errors)
      }
      loadServices()
      loadStats()
    } catch (error) {
      console.error('Failed to import:', error)
      alert('Failed to import services')
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homecare services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Homecare Services Management</h1>
            <p className="text-gray-600 mt-1">Manage homecare services, providers, and schedules</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </label>
            <button
              onClick={() => router.push('/homecare-services/new')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-6">
            <StatsCard title="Total Services" value={stats.totalServices} icon={Heart} color="blue" />
            <StatsCard
              title="Active Services"
              value={stats.activeServices}
              subtitle={`${stats.totalProviders} providers`}
              icon={CheckSquare}
              color="green"
            />
            <StatsCard title="Total Bookings" value={stats.totalBookings} icon={TrendingUp} color="purple" />
            <StatsCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              icon={Users}
              color="orange"
            />
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search services by name, category, type..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Status</option>
                {Object.values(ServiceStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                value={filters.serviceType || ''}
                onChange={(e) => handleFilterChange('serviceType', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Service Types</option>
                {Object.values(ServiceType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={filters.is24x7?.toString() || ''}
                onChange={(e) => handleFilterChange('is24x7', e.target.value ? e.target.value === 'true' : undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Availability</option>
                <option value="true">24x7 Services</option>
                <option value="false">Scheduled Services</option>
              </select>
              <button onClick={handleClearFilters} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <span className="text-blue-700 font-medium">{selectedIds.length} services selected</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('ACTIVATE')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('DEACTIVATE')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('DELETE')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button onClick={handleSelectAll} className="text-gray-500 hover:text-gray-700">
                      {selectedIds.length === services.length && services.length > 0 ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing Tiers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Providers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectOne(service.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedIds.includes(service.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Heart className="w-5 h-5 text-pink-600" />
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-600">
                            ⭐ {service.rating.toFixed(1)} ({service.reviewCount} reviews)
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        {service.serviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {service.pricingTiers.slice(0, 2).map((tier, idx) => (
                          <div key={idx} className="text-gray-900">
                            {tier.name}: ₹{tier.discountedPrice}
                          </div>
                        ))}
                        {service.pricingTiers.length > 2 && (
                          <p className="text-xs text-gray-500">+{service.pricingTiers.length - 2} more</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center text-sm text-gray-600">
                        <UserCheck className="w-4 h-4 mr-1" />
                        {service.providers.length} providers
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {service.availability.is24x7 ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                          24x7
                        </span>
                      ) : (
                        <span className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          Scheduled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          service.status === ServiceStatus.ACTIVE
                            ? 'bg-green-100 text-green-700'
                            : service.status === ServiceStatus.INACTIVE
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/homecare-services/${service.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} services
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExport('CSV')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExport('EXCEL')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
    </div>
  )
}
