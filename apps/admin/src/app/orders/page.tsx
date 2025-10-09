'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { orderAPI } from '@/lib/api/orders'
import type { Order, OrderFilters, OrderStats } from '@/lib/types/orders'
import { OrderStatus, PaymentStatus, PaymentMethod } from '@/lib/types/orders'
import {
  Search,
  Filter,
  Download,
  CheckSquare,
  Square,
  ShoppingBag,
  DollarSign,
  Package,
  TrendingUp,
  Eye,
  FileText,
  X,
} from 'lucide-react'
import { format } from 'date-fns'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<OrderFilters>({})
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadOrders()
    loadStats()
  }, [page, filters])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getOrders({
        page,
        pageSize,
        filters: { ...filters, search: searchQuery },
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      setOrders(response.data)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await orderAPI.getOrderStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadOrders()
  }

  const handleFilterChange = (key: keyof OrderFilters, value: any) => {
    setFilters({ ...filters, [key]: value })
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchQuery('')
    setPage(1)
  }

  const handleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(orders.map((o) => o.id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkStatusUpdate = async (status: OrderStatus) => {
    if (selectedIds.length === 0) {
      alert('Please select at least one order')
      return
    }
    if (!confirm(`Update ${selectedIds.length} orders to ${status}?`)) {
      return
    }
    try {
      await orderAPI.bulkActionOrders({
        orderIds: selectedIds,
        action: 'UPDATE_STATUS',
        status,
      })
      setSelectedIds([])
      loadOrders()
      loadStats()
    } catch (error) {
      console.error('Bulk action failed:', error)
      alert('Failed to perform bulk action')
    }
  }

  const handleExport = async (format: 'CSV' | 'EXCEL' | 'PDF') => {
    try {
      const response = await orderAPI.exportOrders({ format, filters })
      window.open(response.url, '_blank')
    } catch (error) {
      console.error('Failed to export:', error)
      alert('Failed to export orders')
    }
  }

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-700'
      case OrderStatus.CANCELLED:
      case OrderStatus.RETURNED:
        return 'bg-red-100 text-red-700'
      case OrderStatus.SHIPPED:
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'bg-blue-100 text-blue-700'
      case OrderStatus.PRESCRIPTION_PENDING:
      case OrderStatus.PRESCRIPTION_REJECTED:
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'text-green-600'
      case PaymentStatus.FAILED:
        return 'text-red-600'
      case PaymentStatus.REFUNDED:
      case PaymentStatus.PARTIALLY_REFUNDED:
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Manage orders, prescriptions, and fulfillment</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/prescriptions')}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <FileText className="w-4 h-4" />
              <span>Prescriptions</span>
              {stats && stats.prescriptionPendingCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-white text-purple-600 text-xs font-bold rounded-full">
                  {stats.prescriptionPendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-5 gap-6">
            <StatsCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="blue" />
            <StatsCard title="Pending" value={stats.pendingOrders} icon={Package} color="orange" />
            <StatsCard title="Shipped" value={stats.shippedOrders} icon={TrendingUp} color="purple" />
            <StatsCard title="Delivered" value={stats.deliveredOrders} icon={CheckSquare} color="green" />
            <StatsCard
              title="Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              subtitle={`Avg: ₹${stats.averageOrderValue.toFixed(0)}`}
              icon={DollarSign}
              color="indigo"
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
                placeholder="Search by order ID, customer name, phone..."
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
                value={filters.orderStatus || ''}
                onChange={(e) => handleFilterChange('orderStatus', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Order Status</option>
                {Object.values(OrderStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <select
                value={filters.paymentStatus || ''}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Payment Status</option>
                {Object.values(PaymentStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <select
                value={filters.paymentMethod || ''}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Payment Methods</option>
                {Object.values(PaymentMethod).map((method) => (
                  <option key={method} value={method}>
                    {method.replace(/_/g, ' ')}
                  </option>
                ))}
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
            <span className="text-blue-700 font-medium">{selectedIds.length} orders selected</span>
            <div className="flex items-center space-x-2">
              <select
                onChange={(e) => e.target.value && handleBulkStatusUpdate(e.target.value as OrderStatus)}
                className="px-4 py-2 border border-blue-300 rounded-lg bg-white"
                defaultValue=""
              >
                <option value="">Update Status</option>
                <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                <option value={OrderStatus.PACKED}>Packed</option>
                <option value={OrderStatus.SHIPPED}>Shipped</option>
                <option value={OrderStatus.DELIVERED}>Delivered</option>
              </select>
              <button
                onClick={() => handleExport('CSV')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Export Selected
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
                      {selectedIds.length === orders.length && orders.length > 0 ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
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
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectOne(order.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedIds.includes(order.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                        {order.prescriptionRequired && (
                          <span className="inline-flex items-center mt-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                            Rx Required
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                        <p className="text-sm text-gray-600">{order.customer.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{order.paymentMethod.replace(/_/g, ' ')}</p>
                        <p className={`text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getOrderStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} orders
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
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExport('EXCEL')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleExport('PDF')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
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
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
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
