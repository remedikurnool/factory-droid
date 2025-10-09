'use client'

import { useState, useEffect } from 'react'
import { analyticsAPI } from '@/lib/api/analytics'
import type { CustomerReport, TopCustomerData } from '@/lib/types/analytics'
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
import { Download, Users, TrendingUp, DollarSign, UserCheck } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export default function CustomerReportsPage() {
  const [customerReport, setCustomerReport] = useState<CustomerReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))

  useEffect(() => {
    loadCustomerReport()
  }, [startDate, endDate])

  const loadCustomerReport = async () => {
    try {
      setLoading(true)
      const data = await analyticsAPI.getCustomerReport({ startDate, endDate })
      setCustomerReport(data)
    } catch (error) {
      console.error('Failed to load customer report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'CSV' | 'PDF' | 'EXCEL') => {
    try {
      const response = await analyticsAPI.exportReport({
        format,
        reportType: 'CUSTOMERS',
        dateRange: { start: startDate, end: endDate },
      })
      window.open(response.url, '_blank')
    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

  if (loading || !customerReport) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer report...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Customer Reports</h1>
            <p className="text-gray-600 mt-1">Customer acquisition, retention, and analytics</p>
          </div>
          <div className="flex items-center space-x-4">
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
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6">
          <SummaryCard
            title="Total Customers"
            value={customerReport.totalCustomers.toString()}
            icon={Users}
            color="blue"
          />
          <SummaryCard
            title="New Customers"
            value={customerReport.newCustomers.toString()}
            icon={UserCheck}
            color="green"
          />
          <SummaryCard
            title="Avg Lifetime Value"
            value={`₹${customerReport.averageLifetimeValue.toFixed(0)}`}
            icon={DollarSign}
            color="purple"
          />
          <SummaryCard
            title="Retention Rate"
            value={`${customerReport.retentionRate.toFixed(1)}%`}
            subtitle={`${customerReport.churnRate.toFixed(1)}% churn`}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        {/* New Customers Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Customer Acquisition Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customerReport.newCustomersByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="New Customers" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Segments & Geography */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerReport.customerSegments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="customers" fill="#3b82f6" name="Customers" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Top States by Revenue</h3>
            <div className="space-y-3">
              {customerReport.customerGeography.slice(0, 5).map((geo) => (
                <div key={geo.state} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{geo.state}</p>
                    <p className="text-sm text-gray-600">{geo.customers} customers</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{geo.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{geo.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Top Customers by Spend</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Order Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Order
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerReport.topCustomers.map((customer) => (
                  <tr key={customer.customerId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{customer.totalSpend.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.totalOrders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{customer.averageOrderValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(customer.lastOrderDate), 'dd MMM yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
