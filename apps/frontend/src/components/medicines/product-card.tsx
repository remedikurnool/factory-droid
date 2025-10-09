'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/lib/store/cart-store'
import { useWishlistStore } from '@/lib/store/wishlist-store'
import { formatCurrency, calculateDiscount, formatStockStatus } from '@/lib/utils/format'
import type { Medicine } from '@/lib/types/medicine'
import { cn } from '@/lib/utils/cn'

interface ProductCardProps {
  medicine: Medicine
  className?: string
}

export function ProductCard({ medicine, className }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem)
  const isInCart = useCartStore((state) => state.isInCart(medicine.id))
  const toggleWishlist = useWishlistStore((state) => state.toggleItem)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(medicine.id))

  const discount = calculateDiscount(medicine.mrp, medicine.sellingPrice)
  const stockStatus = formatStockStatus(medicine.stock)
  const isOutOfStock = medicine.stock === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isOutOfStock) {
      addToCart(medicine, 1)
    }
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleWishlist(medicine)
  }

  return (
    <Link href={`/medicines/${medicine.slug}`}>
      <Card
        className={cn(
          'group h-full transition-all hover:shadow-lg',
          isOutOfStock && 'opacity-60',
          className
        )}
      >
        <CardContent className="p-4">
          {/* Image */}
          <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-gray-100">
            <Image
              src={medicine.images?.[0] || '/placeholder-medicine.png'}
              alt={medicine.name}
              fill
              className="object-contain p-2 transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Badges */}
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {discount > 0 && (
                <Badge variant="destructive" className="text-xs font-bold">
                  {discount}% OFF
                </Badge>
              )}
              {medicine.prescriptionRequired && (
                <Badge variant="secondary" className="text-xs">
                  ℞ Rx
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className="absolute right-2 top-2 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-100"
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={cn(
                  'h-4 w-4',
                  isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                )}
              />
            </button>
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            {/* Brand */}
            {medicine.brand && (
              <p className="text-xs font-medium text-muted-foreground">
                {medicine.brand.name}
              </p>
            )}

            {/* Name */}
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
              {medicine.name}
            </h3>

            {/* Composition */}
            {medicine.composition && (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {medicine.composition}
              </p>
            )}

            {/* Pack Size */}
            <p className="text-xs text-muted-foreground">
              {medicine.packSize} • {medicine.dosageForm}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(medicine.sellingPrice)}
              </span>
              {discount > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(medicine.mrp)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <Badge variant={stockStatus.variant} className="text-xs">
              {stockStatus.label}
            </Badge>
          </div>
        </CardContent>

        {/* Footer with Add to Cart */}
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full"
            size="sm"
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : isInCart ? (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
