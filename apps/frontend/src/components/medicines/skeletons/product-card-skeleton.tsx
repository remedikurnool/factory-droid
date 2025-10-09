import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        {/* Image Skeleton */}
        <Skeleton className="mb-3 aspect-square w-full rounded-md" />

        {/* Product Info Skeleton */}
        <div className="space-y-2">
          {/* Brand */}
          <Skeleton className="h-3 w-20" />

          {/* Name */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />

          {/* Composition */}
          <Skeleton className="h-3 w-full" />

          {/* Pack Size */}
          <Skeleton className="h-3 w-24" />

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Stock Badge */}
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>

      {/* Footer Skeleton */}
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  )
}

export function ProductCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
