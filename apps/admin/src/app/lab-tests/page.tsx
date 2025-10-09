'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { labTestAPI } from '@/lib/api/services'
import type { LabTest, LabTestFilters, LabTestStats } from '@/lib/types/services'
import { TestStatus, SampleType } from '@/lib/types/services'
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
  TestTube,
  Package,
  Clock,
  TrendingUp,
} from 'lucide-react'

export default function LabTestsPage() {
  const router = useRouter()
  const [tests, setTests] = useState<LabTest[]>([])
  const [stats, setStats] = useState<LabTestStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<LabTestFilters>({})
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadTests()
    loadStats()
  }, [page, filters])

  const loadTests = async () => {
    try {
      setLoading(true)
      const response = await labTestAPI.getLabTests({
        page,
        pageSize,
        filters: { ...filters, search: searchQuery },
      })
      setTests(response.data)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to load lab tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await labTestAPI.getLabTestStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadTests()
  }

  const handleFilterChange = (key: keyof LabTestFilters, value: any) => {
    setFilters({ ...filters, [key]: value })
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchQuery('')
    setPage(1)
  }

  const handleSelectAll = () => {
    if (selectedIds.length === tests.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(tests.map((t) => t.id))
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
      alert('Please select at least one test')
      return
    }
    if (action === 'DELETE' && !confirm(`Are you sure you want to delete ${selectedIds.length} tests?`)) {
      return
    }
    try {
      await labTestAPI.bulkActionLabTests({ ids: selectedIds, action })
      setSelectedIds([])
      loadTests()
      loadStats()
    } catch (error) {
      console.error('Bulk action failed:', error)
      alert('Failed to perform bulk action')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return
    try {
      await labTestAPI.deleteLabTest(id)
      loadTests()
      loadStats()
    } catch (error) {
      console.error('Failed to delete test:', error)
      alert('Failed to delete test')
    }
  }

  const handleExport = async (format: 'CSV' | 'EXCEL') => {
    try {
      const response = await labTestAPI.exportLabTests({ format, filters })
      window.open(response.url, '_blank')
    } catch (error) {
      console.error('Failed to export:', error)
      alert('Failed to export tests')
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const result = await labTestAPI.importLabTests(file)
      alert(`Imported ${result.imported} tests successfully!`)
      if (result.errors.length > 0) {
        console.error('Import errors:', result.errors)
      }
      loadTests()
      loadStats()
    } catch (error) {
      console.error('Failed to import:', error)
      alert('Failed to import tests')
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  if (loading && tests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lab tests...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Lab Tests Management</h1>
            <p className="text-gray-600 mt-1">Manage lab tests, packages, and diagnostics</p>
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
              onClick={() => router.push('/lab-tests/packages/new')}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Package className="w-4 h-4" />
              <span>Create Package</span>
            </button>
            <button
              onClick={() => router.push('/lab-tests/new')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Test</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-6">
            <StatsCard title="Total Tests" value={stats.totalTests} icon={TestTube} color="blue" />
            <StatsCard
              title="Active Tests"
              value={stats.activeTests}
              subtitle={`${stats.packagesCount} packages`}
              icon={CheckSquare}
              color="green"
            />
            <StatsCard title="Total Bookings" value={stats.totalBookings} icon={TrendingUp} color="purple" />
            <StatsCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={Package} color="orange" />
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
                placeholder="Search tests by name, code, category..."
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
                {Object.values(TestStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                value={filters.sampleType || ''}
                onChange={(e) => handleFilterChange('sampleType', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Sample Types</option>
                {Object.values(SampleType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={filters.isPackage?.toString() || ''}
                onChange={(e) => handleFilterChange('isPackage', e.target.value ? e.target.value === 'true' : undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Types</option>
                <option value="true">Packages Only</option>
                <option value="false">Individual Tests</option>
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
            <span className="text-blue-700 font-medium">{selectedIds.length} tests selected</span>
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
                      {selectedIds.length === tests.length && tests.length > 0 ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sample
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
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
                {tests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectOne(test.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedIds.includes(test.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {test.isPackage && <Package className="w-5 h-5 text-purple-600" />}
                        <div>
                          <p className="font-medium text-gray-900">{test.name}</p>
                          <p className="text-sm text-gray-600">
                            {test.homeCollectionAvailable && '🏠 Home Collection'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.sampleType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">₹{test.discountedPrice}</p>
                        {test.discount > 0 && (
                          <p className="text-xs text-gray-500 line-through">₹{test.price}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {test.reportDeliveryTime}h
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          test.status === TestStatus.ACTIVE
                            ? 'bg-green-100 text-green-700'
                            : test.status === TestStatus.INACTIVE
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {test.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/lab-tests/${test.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
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
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} tests
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
