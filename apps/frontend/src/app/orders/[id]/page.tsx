'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  MapPin, 
  Download, 
  RefreshCw, 
  X,
  Truck,
  Phone,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { OrderTimeline } from '@/components/orders/order-timeline'
import { orderAPI } from '@/lib/api/orders'
import { formatCurrency } from '@/lib/utils/format'
import type { Order, OrderStatus } from '@/lib/types/order'
import { format } from 'date-fns'

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  PACKED: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-cyan-100 text-cyan-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  RETURNED: 'bg-gray-100 text-gray-800',
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const data = await orderAPI.getOrderById(orderId)
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    setCancelling(true)
    try {
      await orderAPI.cancelOrder(orderId, 'Changed mind')
      await fetchOrder()
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const handleReorder = async () => {
    try {
      await orderAPI.reorder(orderId)
      router.push('/cart')
    } catch (error) {
      console.error('Error reordering:', error)
      alert('Failed to reorder')
    }
  }

  const handleDownloadInvoice = async () => {
    try {
      const blob = await orderAPI.downloadInvoice(orderId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${order?.orderNumber}.pdf`
      a.click()
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Failed to download invoice')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
          <div className="h-96 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="mb-2 text-lg font-semibold">Order not found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              The order you're looking for doesn't exist
            </p>
            <Button asChild>
              <Link href="/orders">Back to Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canCancel = ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)
  const canReorder = order.status === 'DELIVERED'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <Badge className={statusColors[order.status]}>{order.status}</Badge>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex gap-3">
        {order.status === 'DELIVERED' && (
          <Button variant="outline" onClick={handleDownloadInvoice}>
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
        )}
        {canReorder && (
          <Button variant="outline" onClick={handleReorder}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reorder
          </Button>
        )}
        {canCancel && (
          <Button
            variant="destructive"
            onClick={handleCancelOrder}
            disabled={cancelling}
          >
            <X className="mr-2 h-4 w-4" />
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline
                status={order.status}
                trackingUpdates={order.trackingUpdates}
              />
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div className="h-16 w-16 rounded bg-muted" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.medicineName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold">{order.address.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {order.address.addressLine1}
              </p>
              {order.address.addressLine2 && (
                <p className="text-sm text-muted-foreground">
                  {order.address.addressLine2}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              <p className="text-sm text-muted-foreground">
                Phone: {order.address.phoneNumber}
              </p>
            </CardContent>
          </Card>

          {/* Delivery Partner (if shipped) */}
          {['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Partner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">Blue Dart Express</p>
                <p className="text-sm text-muted-foreground">
                  Tracking ID: {order.orderNumber}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>1800-123-4567</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Price Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>
                  {order.deliveryFee === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatCurrency(order.deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status</span>
                <Badge
                  className={
                    order.paymentStatus === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
