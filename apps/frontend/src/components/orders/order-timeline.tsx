'use client'

import { Check, Clock, Package, Truck, Home, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { OrderStatus, OrderTrackingUpdate } from '@/lib/types/order'
import { format } from 'date-fns'

interface OrderTimelineProps {
  status: OrderStatus
  trackingUpdates?: OrderTrackingUpdate[]
}

const timelineSteps = [
  { status: 'PENDING', label: 'Order Placed', icon: Clock },
  { status: 'CONFIRMED', label: 'Confirmed', icon: Check },
  { status: 'PROCESSING', label: 'Processing', icon: Package },
  { status: 'PACKED', label: 'Packed', icon: Package },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: Home },
]

const statusOrder: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  PACKED: 3,
  SHIPPED: 4,
  OUT_FOR_DELIVERY: 5,
  DELIVERED: 6,
  CANCELLED: -1,
  RETURNED: -1,
}

export function OrderTimeline({ status, trackingUpdates = [] }: OrderTimelineProps) {
  const currentStep = statusOrder[status]
  const isCancelled = status === 'CANCELLED'
  const isReturned = status === 'RETURNED'

  if (isCancelled || isReturned) {
    return (
      <div className="rounded-lg border bg-red-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-100 p-3">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">
              {isCancelled ? 'Order Cancelled' : 'Order Returned'}
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {isCancelled
                ? 'Your order has been cancelled'
                : 'Your order has been returned'}
            </p>
            {trackingUpdates.length > 0 && (
              <p className="mt-2 text-sm text-red-600">
                {format(new Date(trackingUpdates[0].timestamp), 'MMM d, yyyy h:mm a')}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {timelineSteps.map((step, index) => {
        const Icon = step.icon
        const isCompleted = index <= currentStep
        const isCurrent = index === currentStep
        const isLast = index === timelineSteps.length - 1

        // Find tracking update for this step
        const update = trackingUpdates.find((u) => u.status === step.status)

        return (
          <div key={step.status} className="relative">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted bg-background text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <h4
                  className={cn(
                    'font-semibold',
                    isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </h4>
                {update && (
                  <>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {update.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(new Date(update.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                    {update.location && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Location: {update.location}
                      </p>
                    )}
                  </>
                )}
                {!update && isCurrent && (
                  <p className="mt-1 text-sm text-primary">In Progress</p>
                )}
              </div>
            </div>

            {/* Connecting Line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-5 top-10 h-full w-0.5 -translate-x-1/2',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
