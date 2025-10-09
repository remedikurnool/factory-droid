'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { DeliverySlot } from '@/lib/types/order'
import { orderAPI } from '@/lib/api/orders'
import { format, addDays, parseISO } from 'date-fns'

interface DeliverySlotSelectionProps {
  selectedSlot?: DeliverySlot
  onSelect: (slot: DeliverySlot) => void
}

export function DeliverySlotSelection({
  selectedSlot,
  onSelect,
}: DeliverySlotSelectionProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  )
  const [slots, setSlots] = useState<DeliverySlot[]>([])
  const [loading, setLoading] = useState(false)

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE, MMM d'),
      isToday: i === 0,
    }
  })

  useEffect(() => {
    fetchSlots(selectedDate)
  }, [selectedDate])

  const fetchSlots = async (date: string) => {
    setLoading(true)
    try {
      const data = await orderAPI.getDeliverySlots(date)
      setSlots(data)
    } catch (error) {
      console.error('Error fetching delivery slots:', error)
      // Fallback to mock data for demo
      setSlots([
        {
          id: '1',
          date,
          startTime: '09:00',
          endTime: '12:00',
          available: true,
          slotLabel: 'Morning (9 AM - 12 PM)',
        },
        {
          id: '2',
          date,
          startTime: '12:00',
          endTime: '15:00',
          available: true,
          slotLabel: 'Afternoon (12 PM - 3 PM)',
        },
        {
          id: '3',
          date,
          startTime: '15:00',
          endTime: '18:00',
          available: true,
          slotLabel: 'Evening (3 PM - 6 PM)',
        },
        {
          id: '4',
          date,
          startTime: '18:00',
          endTime: '21:00',
          available: false,
          slotLabel: 'Night (6 PM - 9 PM)',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Select Delivery Date</h2>
        <div className="grid grid-cols-7 gap-2">
          {dates.map((date) => (
            <Button
              key={date.value}
              variant={selectedDate === date.value ? 'default' : 'outline'}
              className={cn(
                'flex flex-col items-center p-3 h-auto',
                date.isToday && selectedDate !== date.value && 'border-primary'
              )}
              onClick={() => setSelectedDate(date.value)}
            >
              <Calendar className="h-4 w-4 mb-1" />
              <span className="text-xs font-medium">{date.label}</span>
              {date.isToday && <span className="text-xs text-muted-foreground">Today</span>}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Select Time Slot</h2>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-24 rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : slots.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No slots available</h3>
              <p className="text-sm text-muted-foreground">
                Please select a different date
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id
              const isDisabled = !slot.available

              return (
                <Card
                  key={slot.id}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected && 'border-primary ring-2 ring-primary ring-offset-2',
                    isDisabled && 'cursor-not-allowed opacity-50',
                    !isDisabled && !isSelected && 'hover:border-primary'
                  )}
                  onClick={() => !isDisabled && onSelect(slot)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{slot.slotLabel}</h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {slot.startTime} - {slot.endTime}
                        </p>
                        {isDisabled && (
                          <p className="mt-2 text-xs text-red-500">Not available</p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loading && slots.length > 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            * Standard delivery. Express delivery available at additional cost.
          </p>
        )}
      </div>
    </div>
  )
}
