'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, User, Clock, ChevronRight, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { homecareAPI } from '@/lib/api/homecare'
import { formatCurrency } from '@/lib/utils/format'
import type { HomecareBooking, BookingStatus } from '@/lib/types/homecare'
import { cn } from '@/lib/utils/cn'

const statusColors: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  RESCHEDULED: 'bg-purple-100 text-purple-800',
}

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

export default function BookingsPage() {
  const [activeBookings, setActiveBookings] = useState<HomecareBooking[]>([])
  const [pastBookings, setPastBookings] = useState<HomecareBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      // Fetch active bookings
      const activeData = await homecareAPI.getBookings({
        status: undefined, // All non-completed/cancelled
      })
      
      // Separate active and past bookings
      const active = activeData.bookings.filter(
        (b) => !['COMPLETED', 'CANCELLED'].includes(b.status)
      )
      const past = activeData.bookings.filter((b) =>
        ['COMPLETED', 'CANCELLED'].includes(b.status)
      )

      setActiveBookings(active)
      setPastBookings(past)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const BookingCard = ({ booking }: { booking: HomecareBooking }) => (
    <Link href={`/homecare/bookings/${booking.id}`}>
      <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {booking.service.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Booking #{booking.bookingNumber}
              </p>
            </div>
            <Badge className={cn(statusColors[booking.status])}>
              {booking.status}
            </Badge>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{booking.startDate}</span>
              <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
              <span>{booking.startTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{booking.patientDetails.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="line-clamp-1">
                {booking.address.addressLine1}, {booking.address.city}
              </span>
            </div>
          </div>

          {booking.caretaker && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Caretaker</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.caretaker.name}
                  </p>
                </div>
                {booking.caretaker.verified && (
                  <Badge variant="outline" className="text-xs">
                    ✓ Verified
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Badge className={cn(paymentStatusColors[booking.paymentStatus])}>
                {booking.paymentStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">
                {formatCurrency(booking.totalAmount)}
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  const EmptyState = ({ message }: { message: string }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="mb-2 text-lg font-semibold">No bookings found</h3>
        <p className="mb-4 text-sm text-muted-foreground">{message}</p>
        <Button onClick={() => (window.location.href = '/homecare')}>
          Browse Services
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your homecare service bookings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            Active Bookings ({activeBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Bookings ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="mb-4 h-6 w-3/4" />
                    <Skeleton className="mb-2 h-4 w-full" />
                    <Skeleton className="mb-2 h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeBookings.length === 0 ? (
            <EmptyState message="You don't have any active bookings" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="mb-4 h-6 w-3/4" />
                    <Skeleton className="mb-2 h-4 w-full" />
                    <Skeleton className="mb-2 h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pastBookings.length === 0 ? (
            <EmptyState message="You don't have any past bookings" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
