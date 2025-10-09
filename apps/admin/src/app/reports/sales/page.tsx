'use client'

import { useState, useEffect } from 'react'
import { analyticsAPI } from '@/lib/api/analytics'
import type {
  SalesReport,
  DiscountImpactReport,
  SalesByCategoryData,
  SalesByBrandData,
} from '@/lib/types/analytics'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Tag,
  Package,
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

export default function SalesReportsPage() {
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null)
  const [discountImpact, setDiscountImpact] = useState<DiscountImpactReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'>('MONTHLY')
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))

  useEffect(() => {
    loadSalesReport()
    loadDiscountImpact()
  }, [period, startDate, endDate])

  const loadSalesReport = async () => {
    try {
      setLoading(true)
      const data = await analyticsAPI.getSalesReport({
        period,
        startDate: period === 'CUSTOM' ? startDate : undefined,
        endDate: period === 'CUSTOM' ? endDate : undefined,
      })
      setSalesReport(data)
    } catch (error) {
      console.error('Failed to load sales report:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDiscountImpact = async () => {
    try {
      const data = await analyticsAPI.getDiscountImpact({
        startDate,
        endDate,
      })
      setDiscountImpact(data)
    } catch (error) {
      console.error('Failed to load discount impact:', error)
    }
  }

  const handleExport = async (format: 'CSV' | 'PDF' | 'EXCEL') => {
    try {
      const response = await analyticsAPI.exportReport({
        format,
        reportType: 'SALES',
        dateRange: { start: startDate, end: endDate },
      })
      window.open(response.url, '_blank')
    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

  if (loading || !salesReport) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales report...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive sales analytics and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleExport('CSV')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
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

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Period:</span>
            </div>
            <div className="flex space-x-2">
              {(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg ${
                    period === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {period === 'CUSTOM' && (
              <div className="flex items-center space-x-4 ml-4">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="text-gray-600">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6">
          <SummaryCard
            title="Total Revenue"
            value={`₹${salesReport.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="blue"
          />
          <SummaryCard
            title="Total Orders"
            value={salesReport.totalOrders.toString()}
            icon={ShoppingCart}
            color="green"
          />
          <SummaryCard
            title="Avg Order Value"
            value={`₹${salesReport.averageOrderValue.toFixed(2)}`}
            icon={TrendingUp}
            color="purple"
          />
          <SummaryCard
            title="Net Revenue"
            value={`₹${salesReport.netRevenue.toLocaleString()}`}
            subtitle={`-₹${salesReport.totalDiscount.toLocaleString()} discount`}
            icon={Package}
            color="orange"
          />
        </div>

        {/* Sales Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesReport.salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Revenue (₹)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={2}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category & Brand */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesReport.salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₹)" />
                <Bar dataKey="orders" fill="#10b981" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Sales by Brand</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesReport.salesByBrand}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue (₹)" />
                <Bar dataKey="units" fill="#f59e0b" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesReport.topProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{product.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.units.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{(product.revenue / product.units).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Discount Impact Analysis */}
        {discountImpact && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Discount & Offer Impact Analysis</h3>
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Discounts</p>
                <p className="text-2xl font-bold text-red-600">₹{discountImpact.totalDiscounts.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Avg Discount</p>
                <p className="text-2xl font-bold text-orange-600">₹{discountImpact.averageDiscount.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Orders w/ Discount</p>
                <p className="text-2xl font-bold text-blue-600">{discountImpact.ordersWithDiscount}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Revenue Impact</p>
                <p className="text-2xl font-bold text-purple-600">
                  {discountImpact.revenueImpact > 0 ? '+' : ''}
                  {discountImpact.revenueImpact.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {discountImpact.discountTypes.map((type) => (
                    <tr key={type.type}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {type.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{type.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{type.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: string
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
