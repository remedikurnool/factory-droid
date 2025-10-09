'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Clock,
  Star,
  Phone,
  MessageSquare,
  X,
  RefreshCw,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { homecareAPI } from '@/lib/api/homecare'
import { formatCurrency } from '@/lib/utils/format'
import type { HomecareBooking, BookingStatus } from '@/lib/types/homecare'
import { cn } from '@/lib/utils/cn'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const statusColors: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  RESCHEDULED: 'bg-purple-100 text-purple-800',
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<HomecareBooking | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [extendDialogOpen, setExtendDialogOpen] = useState(false)
  const [rateDialogOpen, setRateDialogOpen] = useState(false)
  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false)

  // Form states
  const [cancelReason, setCancelReason] = useState('')
  const [extensionDays, setExtensionDays] = useState('')
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [replacementReason, setReplacementReason] = useState('')

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    setLoading(true)
    try {
      const data = await homecareAPI.getBookingById(bookingId)
      setBooking(data)
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a cancellation reason')
      return
    }

    try {
      await homecareAPI.cancelBooking({
        bookingId,
        reason: cancelReason,
      })
      setCancelDialogOpen(false)
      fetchBooking()
    } catch (error) {
      console.error('Error canceling booking:', error)
      alert('Failed to cancel booking')
    }
  }

  const handleExtend = async () => {
    if (!extensionDays || parseInt(extensionDays) <= 0) {
      alert('Please enter valid extension days')
      return
    }

    try {
      await homecareAPI.extendBooking({
        bookingId,
        extensionDays: parseInt(extensionDays),
        newEndDate: '', // Calculate based on extension days
      })
      setExtendDialogOpen(false)
      fetchBooking()
    } catch (error) {
      console.error('Error extending booking:', error)
      alert('Failed to extend booking')
    }
  }

  const handleRate = async () => {
    if (!booking?.caretaker || rating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      await homecareAPI.rateCaretaker({
        bookingId,
        caretakerId: booking.caretaker.id,
        rating,
        review,
      })
      setRateDialogOpen(false)
      fetchBooking()
    } catch (error) {
      console.error('Error rating caretaker:', error)
      alert('Failed to submit rating')
    }
  }

  const handleRequestReplacement = async () => {
    if (!replacementReason.trim()) {
      alert('Please provide a reason for replacement')
      return
    }

    try {
      await homecareAPI.requestReplacement({
        bookingId,
        reason: replacementReason,
      })
      setReplacementDialogOpen(false)
      alert('Replacement request submitted successfully')
    } catch (error) {
      console.error('Error requesting replacement:', error)
      alert('Failed to request replacement')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-10 w-32" />
        <Skeleton className="mb-4 h-64 w-full" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="mb-2 text-lg font-semibold">Booking not found</h3>
            <Button onClick={() => router.push('/homecare/bookings')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canExtend = ['CONFIRMED', 'IN_PROGRESS'].includes(booking.status)
  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status)
  const canRate = booking.status === 'COMPLETED' && !booking.caretakerRating
  const canRequestReplacement = ['CONFIRMED', 'IN_PROGRESS'].includes(booking.status)

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.push('/homecare/bookings')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Bookings
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{booking.service.name}</h1>
                  <p className="text-muted-foreground">
                    Booking #{booking.bookingNumber}
                  </p>
                </div>
                <Badge className={cn(statusColors[booking.status])}>
                  {booking.status}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Start Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.startDate} at {booking.startTime}
                    </p>
                  </div>
                </div>
                {booking.endDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">End Date</p>
                      <p className="text-sm text-muted-foreground">{booking.endDate}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Service Plan</p>
                  <p className="font-medium">
                    {booking.pricingOption.type === 'SESSION' &&
                    booking.pricingOption.sessions
                      ? `${booking.pricingOption.sessions} Sessions`
                      : booking.pricingOption.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{booking.pricingOption.description}</p>
                </div>
                {booking.specialRequirements && (
                  <div>
                    <p className="text-sm text-muted-foreground">Special Requirements</p>
                    <p className="font-medium">{booking.specialRequirements}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Patient Details */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{booking.patientDetails.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.patientDetails.age} years, {booking.patientDetails.gender}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <p>{booking.patientDetails.contactNumber}</p>
                </div>
                {booking.patientDetails.medicalCondition && (
                  <div>
                    <p className="text-sm text-muted-foreground">Medical Condition</p>
                    <p className="font-medium">{booking.patientDetails.medicalCondition}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Service Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{booking.address.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.address.addressLine1}
                    {booking.address.addressLine2 && `, ${booking.address.addressLine2}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.address.city}, {booking.address.state} - {booking.address.pincode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phone: {booking.address.phoneNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Caretaker Details */}
          {booking.caretaker && (
            <Card>
              <CardHeader>
                <CardTitle>Caretaker Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl">
                    👤
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{booking.caretaker.name}</h3>
                      {booking.caretaker.verified && (
                        <Badge variant="outline" className="text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{booking.caretaker.rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({booking.caretaker.totalReviews} reviews)
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {booking.caretaker.experience} years of experience
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {booking.caretaker.qualifications.map((qual, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {qual}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {canRequestReplacement && (
                  <Dialog open={replacementDialogOpen} onOpenChange={setReplacementDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full mt-4">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Request Replacement Caretaker
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Replacement Caretaker</DialogTitle>
                        <DialogDescription>
                          Please provide a reason for requesting a replacement caretaker.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Textarea
                          placeholder="Reason for replacement..."
                          value={replacementReason}
                          onChange={(e) => setReplacementReason(e.target.value)}
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setReplacementDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleRequestReplacement} className="flex-1">
                            Submit Request
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          )}

          {/* Previous Rating */}
          {booking.caretakerRating && (
            <Card>
              <CardHeader>
                <CardTitle>Your Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-5 w-5',
                        star <= booking.caretakerRating!
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                {booking.caretakerReview && (
                  <p className="text-muted-foreground">{booking.caretakerReview}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Booking Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Payment Status */}
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                <Badge
                  className={cn(
                    booking.paymentStatus === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : booking.paymentStatus === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  )}
                >
                  {booking.paymentStatus}
                </Badge>
              </div>

              {/* Total Amount */}
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(booking.totalAmount)}</p>
              </div>

              {/* Actions */}
              {canExtend && (
                <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Extend Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Extend Service</DialogTitle>
                      <DialogDescription>
                        How many additional days would you like to extend the service?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="extensionDays">Extension Days</Label>
                        <Input
                          id="extensionDays"
                          type="number"
                          min="1"
                          value={extensionDays}
                          onChange={(e) => setExtensionDays(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setExtendDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleExtend} className="flex-1">
                          Extend
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {canRate && (
                <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Star className="mr-2 h-4 w-4" />
                      Rate Caretaker
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rate Your Experience</DialogTitle>
                      <DialogDescription>
                        Share your feedback about the caretaker's service.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Rating</Label>
                        <div className="flex gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                            >
                              <Star
                                className={cn(
                                  'h-8 w-8 cursor-pointer transition-colors',
                                  star <= rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300 hover:text-amber-200'
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="review">Review (Optional)</Label>
                        <Textarea
                          id="review"
                          placeholder="Share your experience..."
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setRateDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleRate} className="flex-1" disabled={rating === 0}>
                          Submit Rating
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {canCancel && (
                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <X className="mr-2 h-4 w-4" />
                      Cancel Booking
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Booking</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this booking? This action cannot be
                        undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Textarea
                        placeholder="Reason for cancellation..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setCancelDialogOpen(false)}
                          className="flex-1"
                        >
                          Keep Booking
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleCancel}
                          className="flex-1"
                        >
                          Cancel Booking
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
