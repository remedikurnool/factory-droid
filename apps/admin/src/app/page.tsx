import { APP_NAME } from '@onemedi/shared'

export default function AdminHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          {APP_NAME} Admin Panel
        </h1>
        <p className="text-center text-xl text-muted-foreground mb-4">
          🏥 Healthcare Platform Management Dashboard
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card">
            <h2 className="text-xl font-semibold mb-2">📊 Dashboard</h2>
            <p className="text-muted-foreground">KPIs, analytics, and real-time insights</p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card">
            <h2 className="text-xl font-semibold mb-2">📝 Catalog</h2>
            <p className="text-muted-foreground">Manage medicines, tests, and services</p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card">
            <h2 className="text-xl font-semibold mb-2">📦 Orders</h2>
            <p className="text-muted-foreground">Live tracking and status updates</p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card">
            <h2 className="text-xl font-semibold mb-2">👥 Users</h2>
            <p className="text-muted-foreground">User management and RBAC</p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card">
            <h2 className="text-xl font-semibold mb-2">🎯 Marketing</h2>
            <p className="text-muted-foreground">Banners, offers, and coupons</p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card">
            <h2 className="text-xl font-semibold mb-2">📈 Reports</h2>
            <p className="text-muted-foreground">Sales and performance analytics</p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Built with Next.js 14+ | TypeScript | Tailwind CSS | Recharts
          </p>
        </div>
      </div>
    </main>
  )
}
