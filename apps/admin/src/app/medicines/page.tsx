'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { medicineAPI } from '@/lib/api/medicine'
import type { Medicine, MedicineFilters, MedicineStats } from '@/lib/types/medicine'
import { MedicineStatus, DosageForm } from '@/lib/types/medicine'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  Upload,
  CheckSquare,
  Square,
  MoreVertical,
  Package,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'

export default function MedicinesPage() {
  const router = useRouter()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [stats, setStats] = useState<MedicineStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<MedicineFilters>({})
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadMedicines()
    loadStats()
  }, [page, filters])

  const loadMedicines = async () => {
    try {
      setLoading(true)
      const response = await medicineAPI.getMedicines({
        page,
        pageSize,
        filters: { ...filters, search: searchQuery },
      })
      setMedicines(response.data)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to load medicines:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await medicineAPI.getMedicineStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadMedicines()
  }

  const handleFilterChange = (key: keyof MedicineFilters, value: any) => {
    setFilters({ ...filters, [key]: value })
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchQuery('')
    setPage(1)
  }

  const handleSelectAll = () => {
    if (selectedIds.length === medicines.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(medicines.map((m) => m.id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkAction = async (action: 'PUBLISH' | 'UNPUBLISH' | 'DELETE' | 'FEATURE') => {
    if (selectedIds.length === 0) {
      alert('Please select at least one medicine')
      return
    }
    if (action === 'DELETE' && !confirm(`Are you sure you want to delete ${selectedIds.length} medicines?`)) {
      return
    }
    try {
      await medicineAPI.bulkActionMedicines({ medicineIds: selectedIds, action })
      setSelectedIds([])
      loadMedicines()
      loadStats()
    } catch (error) {
      console.error('Bulk action failed:', error)
      alert('Failed to perform bulk action')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return
    try {
      await medicineAPI.deleteMedicine(id)
      loadMedicines()
      loadStats()
    } catch (error) {
      console.error('Failed to delete medicine:', error)
      alert('Failed to delete medicine')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await medicineAPI.duplicateMedicine(id)
      loadMedicines()
      loadStats()
    } catch (error) {
      console.error('Failed to duplicate medicine:', error)
      alert('Failed to duplicate medicine')
    }
  }

  const handleExport = async (format: 'CSV' | 'EXCEL') => {
    try {
      const response = await medicineAPI.exportMedicines({ format, filters })
      window.open(response.url, '_blank')
    } catch (error) {
      console.error('Failed to export:', error)
      alert('Failed to export medicines')
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const result = await medicineAPI.importMedicines(file)
      alert(`Imported ${result.imported} medicines successfully!`)
      if (result.errors.length > 0) {
        console.error('Import errors:', result.errors)
      }
      loadMedicines()
      loadStats()
    } catch (error) {
      console.error('Failed to import:', error)
      alert('Failed to import medicines')
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  if (loading && medicines.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading medicines...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Medicine Management</h1>
            <p className="text-gray-600 mt-1">Manage your medicine catalog</p>
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
              onClick={() => router.push('/medicines/new')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-6">
            <StatsCard title="Total Products" value={stats.totalProducts} icon={Package} color="blue" />
            <StatsCard
              title="Published"
              value={stats.publishedProducts}
              subtitle={`${stats.draftProducts} drafts`}
              icon={CheckSquare}
              color="green"
            />
            <StatsCard
              title="Out of Stock"
              value={stats.outOfStockProducts}
              subtitle={`${stats.lowStockProducts} low stock`}
              icon={AlertCircle}
              color="red"
            />
            <StatsCard
              title="Total Value"
              value={`₹${stats.totalValue.toLocaleString()}`}
              icon={Package}
              color="purple"
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
                placeholder="Search medicines by name, brand, category..."
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
                {Object.values(MedicineStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                value={filters.dosageForm || ''}
                onChange={(e) => handleFilterChange('dosageForm', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Dosage Forms</option>
                {Object.values(DosageForm).map((form) => (
                  <option key={form} value={form}>
                    {form}
                  </option>
                ))}
              </select>
              <select
                value={filters.prescriptionRequired?.toString() || ''}
                onChange={(e) =>
                  handleFilterChange('prescriptionRequired', e.target.value ? e.target.value === 'true' : undefined)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Prescriptions</option>
                <option value="true">Prescription Required</option>
                <option value="false">No Prescription</option>
              </select>
              <button
                onClick={handleClearFilters}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <span className="text-blue-700 font-medium">{selectedIds.length} medicines selected</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('PUBLISH')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkAction('UNPUBLISH')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Unpublish
              </button>
              <button
                onClick={() => handleBulkAction('FEATURE')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Feature
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
                      {selectedIds.length === medicines.length && medicines.length > 0 ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
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
                {medicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectOne(medicine.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedIds.includes(medicine.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={medicine.thumbnail || '/placeholder-medicine.png'}
                          alt={medicine.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{medicine.name}</p>
                          <p className="text-sm text-gray-600">{medicine.dosageForm} • {medicine.strength}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.brand}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">₹{medicine.sellingPrice}</p>
                        {medicine.discount > 0 && (
                          <p className="text-xs text-gray-500 line-through">₹{medicine.mrp}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          medicine.stockQuantity === 0
                            ? 'text-red-600'
                            : medicine.stockQuantity <= medicine.minStockLevel
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {medicine.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          medicine.status === MedicineStatus.PUBLISHED
                            ? 'bg-green-100 text-green-700'
                            : medicine.status === MedicineStatus.DRAFT
                            ? 'bg-yellow-100 text-yellow-700'
                            : medicine.status === MedicineStatus.OUT_OF_STOCK
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {medicine.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/medicines/${medicine.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(medicine.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(medicine.id)}
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
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} medicines
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
  color: 'blue' | 'green' | 'red' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
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
