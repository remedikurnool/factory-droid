'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { orderAPI, prescriptionAPI } from '@/lib/api/orders'
import type { Order, DeliveryPartner, Prescription } from '@/lib/types/orders'
import { OrderStatus, PaymentStatus, PrescriptionStatus } from '@/lib/types/orders'
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  FileText,
  Edit,
  X,
  Check,
  Download,
  Printer,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([])
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [refundAmount, setRefundAmount] = useState(0)
  const [refundReason, setRefundReason] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [noteText, setNoteText] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(true)
  const [selectedPartnerId, setSelectedPartnerId] = useState('')

  useEffect(() => {
    loadOrder()
    loadDeliveryPartners()
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const data = await orderAPI.getOrder(orderId)
      setOrder(data)
      setRefundAmount(data.total)
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDeliveryPartners = async () => {
    try {
      const data = await orderAPI.getDeliveryPartners()
      setDeliveryPartners(data)
    } catch (error) {
      console.error('Failed to load delivery partners:', error)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return
    try {
      await orderAPI.updateOrderStatus({
        orderId,
        status: selectedStatus,
        note: noteText || undefined,
      })
      setShowStatusModal(false)
      setSelectedStatus(null)
      setNoteText('')
      loadOrder()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update order status')
    }
  }

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a cancellation reason')
      return
    }
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      await orderAPI.cancelOrder({
        orderId,
        reason: cancelReason,
        refundAmount: order?.paymentStatus === PaymentStatus.COMPLETED ? order.total : undefined,
      })
      setShowCancelModal(false)
      setCancelReason('')
      loadOrder()
    } catch (error) {
      console.error('Failed to cancel order:', error)
      alert('Failed to cancel order')
    }
  }

  const handleInitiateRefund = async () => {
    if (!refundReason.trim()) {
      alert('Please provide a refund reason')
      return
    }
    if (refundAmount <= 0 || refundAmount > (order?.total || 0)) {
      alert('Invalid refund amount')
      return
    }
    if (!confirm(`Initiate refund of ₹${refundAmount}?`)) return
    try {
      await orderAPI.initiateRefund({
        orderId,
        amount: refundAmount,
        reason: refundReason,
      })
      setShowRefundModal(false)
      setRefundReason('')
      loadOrder()
    } catch (error) {
      console.error('Failed to initiate refund:', error)
      alert('Failed to initiate refund')
    }
  }

  const handleUpdateTracking = async () => {
    if (!trackingNumber.trim()) {
      alert('Please provide tracking number')
      return
    }
    try {
      await orderAPI.updateTracking({
        orderId,
        trackingNumber,
        trackingUrl: trackingUrl || '',
      })
      setShowTrackingModal(false)
      setTrackingNumber('')
      setTrackingUrl('')
      loadOrder()
    } catch (error) {
      console.error('Failed to update tracking:', error)
      alert('Failed to update tracking')
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      alert('Please enter a note')
      return
    }
    try {
      await orderAPI.addOrderNote({
        orderId,
        note: noteText,
        isInternal: isInternalNote,
      })
      setShowNoteModal(false)
      setNoteText('')
      loadOrder()
    } catch (error) {
      console.error('Failed to add note:', error)
      alert('Failed to add note')
    }
  }

  const handleAssignPartner = async () => {
    if (!selectedPartnerId) {
      alert('Please select a delivery partner')
      return
    }
    try {
      await orderAPI.assignDeliveryPartner({
        orderId,
        deliveryPartnerId: selectedPartnerId,
      })
      setShowAssignModal(false)
      setSelectedPartnerId('')
      loadOrder()
    } catch (error) {
      console.error('Failed to assign partner:', error)
      alert('Failed to assign delivery partner')
    }
  }

  const handlePrintInvoice = async () => {
    try {
      await orderAPI.printInvoice(orderId)
    } catch (error) {
      console.error('Failed to print invoice:', error)
      alert('Failed to print invoice')
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-700 border-green-300'
      case OrderStatus.CANCELLED:
      case OrderStatus.RETURNED:
        return 'bg-red-100 text-red-700 border-red-300'
      case OrderStatus.SHIPPED:
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case OrderStatus.PRESCRIPTION_PENDING:
      case OrderStatus.PRESCRIPTION_REJECTED:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getTimelineIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case OrderStatus.CANCELLED:
        return <Ban className="w-5 h-5 text-red-600" />
      case OrderStatus.SHIPPED:
      case OrderStatus.OUT_FOR_DELIVERY:
        return <Truck className="w-5 h-5 text-blue-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist</p>
          <button onClick={() => router.push('/orders')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/orders')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600 mt-1">
                Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintInvoice}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Order Status and Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-lg font-semibold border-2 ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
              {order.prescriptionRequired && (
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium border-2 border-purple-300">
                  Prescription Required
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowStatusModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                <span>Update Status</span>
              </button>
              {order.orderStatus !== OrderStatus.CANCELLED && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel Order</span>
                </button>
              )}
              {order.paymentStatus === PaymentStatus.COMPLETED && order.orderStatus !== OrderStatus.REFUNDED && (
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refund</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setShowTrackingModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 border border-purple-200"
            >
              <Truck className="w-5 h-5" />
              <span>Update Tracking</span>
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 border border-indigo-200"
            >
              <User className="w-5 h-5" />
              <span>Assign Partner</span>
            </button>
            <button
              onClick={() => setShowNoteModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Add Note</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Items ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0">
                    {item.image && (
                      <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-600">Type: {item.productType}</p>
                      {item.prescriptionRequired && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                          Rx Required
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-semibold text-gray-900">₹{item.price.toLocaleString()}</p>
                      {item.discount > 0 && <p className="text-xs text-green-600">-₹{item.discount}</p>}
                      <p className="text-sm font-bold text-gray-900 mt-1">₹{item.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Charges</span>
                  <span>₹{order.deliveryCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>₹{order.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span>₹{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Order Timeline
              </h2>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={event.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{getTimelineIcon(event.status)}</div>
                    <div className="flex-1 pb-4 border-b border-gray-200 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <span className="text-sm text-gray-600">
                          {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      {event.userName && <p className="text-xs text-gray-500 mt-1">By: {event.userName}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {order.notes.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Notes
                </h2>
                <div className="space-y-3">
                  {order.notes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-lg ${note.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{note.userName}</span>
                        <div className="flex items-center space-x-2">
                          {note.isInternal && (
                            <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded">Internal</span>
                          )}
                          <span className="text-sm text-gray-600">
                            {format(new Date(note.createdAt), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{order.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900">{order.customer.phone}</p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="font-semibold text-gray-900">{order.customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="font-semibold text-gray-900">₹{order.customer.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Delivery Address
              </h2>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">{order.deliveryAddress.fullName}</p>
                <p className="text-gray-700">{order.deliveryAddress.phone}</p>
                <p className="text-gray-700">{order.deliveryAddress.addressLine1}</p>
                {order.deliveryAddress.addressLine2 && <p className="text-gray-700">{order.deliveryAddress.addressLine2}</p>}
                <p className="text-gray-700">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                </p>
                {order.deliveryAddress.landmark && (
                  <p className="text-sm text-gray-600">Landmark: {order.deliveryAddress.landmark}</p>
                )}
                <span className="inline-block mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
                  {order.deliveryAddress.addressType}
                </span>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900">{order.paymentMethod.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded font-medium ${
                      order.paymentStatus === PaymentStatus.COMPLETED
                        ? 'bg-green-100 text-green-700'
                        : order.paymentStatus === PaymentStatus.FAILED
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                {order.paymentId && (
                  <div>
                    <p className="text-sm text-gray-600">Payment ID</p>
                    <p className="text-sm text-gray-900 font-mono">{order.paymentId}</p>
                  </div>
                )}
                {order.transactionId && (
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="text-sm text-gray-900 font-mono">{order.transactionId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Partner */}
            {order.deliveryPartner && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Delivery Partner
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{order.deliveryPartner.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900">{order.deliveryPartner.phone}</p>
                  </div>
                  {order.deliveryPartner.vehicleNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Number</p>
                      <p className="text-gray-900">{order.deliveryPartner.vehicleNumber}</p>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-mono text-gray-900">{order.trackingNumber}</p>
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Track Package →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prescription Status */}
            {order.prescriptionRequired && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Prescription
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded font-medium ${
                        order.prescriptionStatus === PrescriptionStatus.VERIFIED
                          ? 'bg-green-100 text-green-700'
                          : order.prescriptionStatus === PrescriptionStatus.REJECTED
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.prescriptionStatus?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {order.prescriptions && order.prescriptions.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Uploaded Files</p>
                      {order.prescriptions.map((rx) => (
                        <div key={rx.id} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-900">{rx.fileName}</span>
                          <button
                            onClick={() => prescriptionAPI.downloadPrescription(rx.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => router.push(`/prescriptions?orderId=${order.id}`)}
                    className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    View Prescription Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showStatusModal && (
        <Modal onClose={() => setShowStatusModal(false)} title="Update Order Status">
          <div className="space-y-4">
            <select
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Status</option>
              {Object.values(OrderStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
            <button
              onClick={handleUpdateStatus}
              disabled={!selectedStatus}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Update Status
            </button>
          </div>
        </Modal>
      )}

      {showCancelModal && (
        <Modal onClose={() => setShowCancelModal(false)} title="Cancel Order">
          <div className="space-y-4">
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={4}
            />
            <button
              onClick={handleCancelOrder}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Cancel Order
            </button>
          </div>
        </Modal>
      )}

      {showRefundModal && (
        <Modal onClose={() => setShowRefundModal(false)} title="Initiate Refund">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Refund Amount</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                max={order.total}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-1">Maximum: ₹{order.total.toLocaleString()}</p>
            </div>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Reason for refund"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={4}
            />
            <button
              onClick={handleInitiateRefund}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Initiate Refund
            </button>
          </div>
        </Modal>
      )}

      {showTrackingModal && (
        <Modal onClose={() => setShowTrackingModal(false)} title="Update Tracking">
          <div className="space-y-4">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking Number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="Tracking URL (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleUpdateTracking}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Update Tracking
            </button>
          </div>
        </Modal>
      )}

      {showNoteModal && (
        <Modal onClose={() => setShowNoteModal(false)} title="Add Note">
          <div className="space-y-4">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter note..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={4}
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isInternalNote}
                onChange={(e) => setIsInternalNote(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Internal Note (not visible to customer)</span>
            </label>
            <button
              onClick={handleAddNote}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Note
            </button>
          </div>
        </Modal>
      )}

      {showAssignModal && (
        <Modal onClose={() => setShowAssignModal(false)} title="Assign Delivery Partner">
          <div className="space-y-4">
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Partner</option>
              {deliveryPartners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name} - {partner.phone}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignPartner}
              disabled={!selectedPartnerId}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
              Assign Partner
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
