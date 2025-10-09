'use client'

import Link from 'next/link'
import { Star, Clock, Check, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/format'
import type { HomecareService } from '@/lib/types/homecare'
import { cn } from '@/lib/utils/cn'

interface ServiceCardProps {
  service: HomecareService
  className?: string
}

const categoryColors: Record<string, string> = {
  NURSING: 'bg-blue-100 text-blue-800',
  PHYSIOTHERAPY: 'bg-purple-100 text-purple-800',
  DIABETES_CARE: 'bg-red-100 text-red-800',
  ELDERLY_CARE: 'bg-green-100 text-green-800',
  POST_SURGERY_CARE: 'bg-orange-100 text-orange-800',
  MEDICAL_EQUIPMENT: 'bg-cyan-100 text-cyan-800',
  LAB_SAMPLE_COLLECTION: 'bg-pink-100 text-pink-800',
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  // Get price range from pricing options
  const prices = service.pricingOptions.map((option) =>
    option.discountPrice || option.price
  )
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return (
    <Link href={`/homecare/${service.id}`}>
      <Card
        className={cn(
          'group cursor-pointer transition-all hover:shadow-lg hover:border-primary',
          !service.available && 'opacity-60',
          className
        )}
      >
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-primary/5">
            {/* Placeholder for image */}
            <div className="flex h-full items-center justify-center">
              <div className="text-6xl">🏥</div>
            </div>

            {/* Category Badge */}
            <Badge
              className={cn(
                'absolute left-3 top-3',
                categoryColors[service.category]
              )}
            >
              {service.category.replace(/_/g, ' ')}
            </Badge>

            {/* Availability Badge */}
            {!service.available && (
              <Badge className="absolute right-3 top-3 bg-red-600 text-white">
                Unavailable
              </Badge>
            )}
          </div>

          <div className="p-4">
            {/* Title and Rating */}
            <div className="mb-2">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                {service.name}
              </h3>
              {service.rating && (
                <div className="mt-1 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{service.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({service.totalReviews} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
              {service.shortDescription}
            </p>

            {/* Included Items Preview */}
            {service.included.length > 0 && (
              <div className="mb-3 space-y-1">
                {service.included.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-green-600 shrink-0" />
                    <span className="line-clamp-1">{item}</span>
                  </div>
                ))}
                {service.included.length > 2 && (
                  <p className="text-xs text-primary">
                    +{service.included.length - 2} more benefits
                  </p>
                )}
              </div>
            )}

            {/* Pricing */}
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground">Starting from</span>
              <span className="text-xl font-bold">
                {formatCurrency(minPrice)}
              </span>
              {minPrice !== maxPrice && (
                <span className="text-sm text-muted-foreground">onwards</span>
              )}
            </div>

            {/* Pricing Variants Preview */}
            <div className="mb-3 flex flex-wrap gap-1">
              {service.pricingOptions.slice(0, 3).map((option) => (
                <Badge key={option.id} variant="outline" className="text-xs">
                  {option.type === 'SESSION' && option.sessions
                    ? `${option.sessions} Sessions`
                    : option.type}
                </Badge>
              ))}
              {service.pricingOptions.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{service.pricingOptions.length - 3} more
                </Badge>
              )}
            </div>

            {/* View Details Button */}
            <Button
              variant="outline"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
              size="sm"
            >
              View Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
