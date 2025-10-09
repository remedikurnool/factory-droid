'use client'

import { useState, useEffect } from 'react'
import { analyticsAPI } from '@/lib/api/analytics'
import type {
  DashboardKPIs,
  RevenueTrendData,
  OrdersByStatusData,
  TopProductData,
  CustomerGrowthData,
  HourlyOrderData,
  ServiceModuleOrdersData,
  LiveData,
  RecentOrder,
  QuickActionData,
} from '@/lib/types/analytics'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  AlertCircle,
  Bell,
  Send,
  Download,
  RefreshCw,
  Activity,
  Clock,
} from 'lucide-react'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendData[]>([])
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatusData[]>([])
  const [topProducts, setTopProducts] = useState<TopProductData[]>([])
  const [customerGrowth, setCustomerGrowth] = useState<CustomerGrowthData[]>([])
  const [hourlyOrders, setHourlyOrders] = useState<HourlyOrderData[]>([])
  const [serviceModuleOrders, setServiceModuleOrders] = useState<ServiceModuleOrdersData[]>([])
  const [liveData, setLiveData] = useState<LiveData | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [quickActions, setQuickActions] = useState<QuickActionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Auto-refresh live data every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadLiveData()
      loadRecentOrders()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [
        kpisData,
        trendData,
        statusData,
        productsData,
        growthData,
        hourlyData,
        serviceData,
        live,
        orders,
        actions,
      ] = await Promise.all([
        analyticsAPI.getDashboardKPIs(),
        analyticsAPI.getRevenueTrend(30),
        analyticsAPI.getOrdersByStatus(),
        analyticsAPI.getTopProducts(10),
        analyticsAPI.getCustomerGrowth(30),
        analyticsAPI.getHourlyOrders(),
        analyticsAPI.getOrdersByServiceModule(),
        analyticsAPI.getLiveData(),
        analyticsAPI.getRecentOrders(10),
        analyticsAPI.getQuickActions(),
      ])

      setKpis(kpisData)
      setRevenueTrend(trendData)
      setOrdersByStatus(statusData)
      setTopProducts(productsData)
      setCustomerGrowth(growthData)
      setHourlyOrders(hourlyData)
      setServiceModuleOrders(serviceData)
      setLiveData(live)
      setRecentOrders(orders)
      setQuickActions(actions)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLiveData = async () => {
    try {
      const live = await analyticsAPI.getLiveData()
      setLiveData(live)
    } catch (error) {
      console.error('Failed to load live data:', error)
    }
  }

  const loadRecentOrders = async () => {
    try {
      const orders = await analyticsAPI.getRecentOrders(10)
      setRecentOrders(orders)
    } catch (error) {
      console.error('Failed to load recent orders:', error)
    }
  }

  if (loading || !kpis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={loadDashboardData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Live Stats Bar */}
        {liveData && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="grid grid-cols-4 gap-6">
              <div className="flex items-center space-x-4">
                <Activity className="w-10 h-10 opacity-80" />
                <div>
                  <p className="text-sm opacity-90">Live Order Count</p>
                  <p className="text-3xl font-bold">{liveData.orderCount}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Users className="w-10 h-10 opacity-80" />
                <div>
                  <p className="text-sm opacity-90">Active Users</p>
                  <p className="text-3xl font-bold">{liveData.activeUsers}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <DollarSign className="w-10 h-10 opacity-80" />
                <div>
                  <p className="text-sm opacity-90">Today's Revenue</p>
                  <p className="text-3xl font-bold">₹{liveData.todayRevenue.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="w-10 h-10 opacity-80" />
                <div>
                  <p className="text-sm opacity-90">Last Update</p>
                  <p className="text-lg font-medium">{format(new Date(liveData.lastUpdate), 'HH:mm:ss')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6">
          {/* Total Revenue */}
          <KPICard
            title="Total Revenue"
            value={`₹${kpis.revenue.today.toLocaleString()}`}
            subtitle="Today"
            growth={kpis.revenue.growth.daily}
            icon={DollarSign}
            color="blue"
            details={[
              { label: 'Yesterday', value: `₹${kpis.revenue.yesterday.toLocaleString()}` },
              { label: 'This Week', value: `₹${kpis.revenue.week.toLocaleString()}` },
              { label: 'This Month', value: `₹${kpis.revenue.month.toLocaleString()}` },
            ]}
          />

          {/* Total Orders */}
          <KPICard
            title="Total Orders"
            value={kpis.orders.total.toString()}
            subtitle={`${kpis.orders.pending} Pending`}
            growth={kpis.orders.growth.daily}
            icon={ShoppingCart}
            color="green"
            details={[
              { label: 'Confirmed', value: kpis.orders.confirmed.toString() },
              { label: 'Delivered', value: kpis.orders.delivered.toString() },
              { label: 'Cancelled', value: kpis.orders.cancelled.toString() },
            ]}
          />

          {/* Total Customers */}
          <KPICard
            title="Total Customers"
            value={kpis.customers.total.toString()}
            subtitle={`${kpis.customers.new} New`}
            growth={kpis.customers.growth.daily}
            icon={Users}
            color="purple"
            details={[
              { label: 'New', value: kpis.customers.new.toString() },
              { label: 'Returning', value: kpis.customers.returning.toString() },
              { label: 'Active', value: kpis.customers.active.toString() },
            ]}
          />

          {/* Average Order Value */}
          <KPICard
            title="Avg Order Value"
            value={`₹${kpis.performance.averageOrderValue.toFixed(2)}`}
            subtitle={`${kpis.performance.conversionRate.toFixed(1)}% Conv. Rate`}
            growth={0}
            icon={Package}
            color="orange"
            details={[
              { label: 'Conv. Rate', value: `${kpis.performance.conversionRate.toFixed(1)}%` },
              { label: 'CLV', value: `₹${kpis.performance.customerLifetimeValue.toFixed(0)}` },
              { label: 'Repeat Rate', value: `${kpis.performance.repeatPurchaseRate.toFixed(1)}%` },
            ]}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue (₹)" />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.status}: ${entry.count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₹)" />
                <Bar dataKey="units" fill="#10b981" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Growth */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Growth (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="newCustomers"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  name="New Customers"
                />
                <Area
                  type="monotone"
                  dataKey="returningCustomers"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  name="Returning Customers"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Hourly Order Heatmap */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Hourly Order Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#8b5cf6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Service Module */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Orders by Service Module</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceModuleOrders}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.module}: ${entry.count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {serviceModuleOrders.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Recent Orders */}
        <div className="grid grid-cols-3 gap-6">
          {/* Quick Actions */}
          {quickActions && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <QuickActionButton
                  label="View Pending Orders"
                  count={quickActions.pendingOrders}
                  icon={ShoppingCart}
                  color="blue"
                  href="/admin/orders?status=pending"
                />
                <QuickActionButton
                  label="Process Refunds"
                  count={quickActions.pendingRefunds}
                  icon={DollarSign}
                  color="red"
                  href="/admin/refunds"
                />
                <QuickActionButton
                  label="Low Stock Alerts"
                  count={quickActions.lowStockAlerts}
                  icon={AlertCircle}
                  color="yellow"
                  href="/admin/inventory?filter=low-stock"
                />
                <QuickActionButton
                  label="Expiring Products"
                  count={quickActions.expiringProducts}
                  icon={Package}
                  color="orange"
                  href="/admin/inventory?filter=expiring"
                />
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Send className="w-4 h-4" />
                  <span>Send Notification</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Download className="w-4 h-4" />
                  <span>Export Reports</span>
                </button>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">#{order.orderNumber}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.customerName} • {order.items} items • {order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{order.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{format(new Date(order.createdAt), 'HH:mm')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ KPI Card Component ============
function KPICard({
  title,
  value,
  subtitle,
  growth,
  icon: Icon,
  color,
  details,
}: {
  title: string
  value: string
  subtitle: string
  growth: number
  icon: any
  color: 'blue' | 'green' | 'purple' | 'orange'
  details: { label: string; value: string }[]
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {growth !== 0 && (
          <div className={`flex items-center space-x-1 ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{Math.abs(growth).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-600">{detail.label}</span>
            <span className="font-medium text-gray-900">{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ Quick Action Button Component ============
function QuickActionButton({
  label,
  count,
  icon: Icon,
  color,
  href,
}: {
  label: string
  count: number
  icon: any
  color: 'blue' | 'red' | 'yellow' | 'orange'
  href: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    red: 'bg-red-50 text-red-700 hover:bg-red-100',
    yellow: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
  }

  return (
    <a
      href={href}
      className={`flex items-center justify-between p-3 rounded-lg ${colorClasses[color]} transition-colors`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
      {count > 0 && (
        <span className="px-2 py-1 bg-white rounded-full text-sm font-bold">
          {count}
        </span>
      )}
    </a>
  )
}

// ============ Helper Functions ============
function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-cyan-100 text-cyan-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}
