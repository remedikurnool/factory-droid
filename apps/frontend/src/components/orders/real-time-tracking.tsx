'use client'

import { useEffect } from 'react'
import { Loader2, Wifi, WifiOff, MapPin, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useOrderTracking, useWebSocket } from '@/hooks/use-websocket'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

interface RealTimeTrackingProps {
  orderId: string
  className?: string
}

export function RealTimeTracking({ orderId, className }: RealTimeTrackingProps) {
  const { connected } = useWebSocket()
  const { orderUpdate, updates } = useOrderTracking(orderId)

  return (
    <Card className={cn('border-2', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Tracking
          </span>
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-xs font-normal text-green-600">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-normal text-gray-400">Offline</span>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!connected && (
          <Alert className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Real-time tracking unavailable. Updates will appear when connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {connected && updates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Waiting for order updates...
            </p>
          </div>
        )}

        {updates.length > 0 && (
          <div className="space-y-4">
            {updates.map((update, index) => (
              <div
                key={`${update.timestamp}-${index}`}
                className={cn(
                  'relative rounded-lg border p-4',
                  index === 0 && 'border-primary bg-primary/5'
                )}
              >
                {index === 0 && (
                  <Badge className="absolute -top-2 right-2 bg-primary">
                    Latest
                  </Badge>
                )}
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-primary/10 p-2">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold">{update.status}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {update.message}
                        </p>
                        {update.location && (
                          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {update.location}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(update.timestamp), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            📱 You'll receive notifications for important order updates
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
