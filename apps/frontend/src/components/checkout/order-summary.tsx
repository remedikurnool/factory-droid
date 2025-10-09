'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/format'
import { useCartStore } from '@/lib/store/cart-store'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'

interface OrderSummaryProps {
  couponDiscount?: number
  tax?: number
  showItems?: boolean
}

export function OrderSummary({
  couponDiscount = 0,
  tax = 0,
  showItems = true,
}: OrderSummaryProps) {
  const { items, subtotal, discount, deliveryFee, total } = useCartStore()

  const finalTotal = total - couponDiscount + tax

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        {showItems && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {item.medicine.images?.[0] ? (
                    <Image
                      src={item.medicine.images[0]}
                      alt={item.medicine.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">
                      {item.medicine.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                    {item.medicine.prescriptionRequired && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        ℞ Rx
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-semibold">
                    {formatCurrency(item.medicine.sellingPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
            <Separator />
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({items.length} items)</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Product Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}

          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Coupon Discount</span>
              <span>-{formatCurrency(couponDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>
              {deliveryFee === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                formatCurrency(deliveryFee)
              )}
            </span>
          </div>

          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>GST (18%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total Amount</span>
            <span className="text-lg">{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        {/* Savings Badge */}
        {(discount > 0 || couponDiscount > 0) && (
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="text-sm font-medium text-green-900">
              You're saving {formatCurrency(discount + couponDiscount)}! 🎉
            </p>
          </div>
        )}

        {/* Free Delivery Message */}
        {deliveryFee > 0 && subtotal < 500 && (
          <p className="text-xs text-center text-muted-foreground">
            Add {formatCurrency(500 - subtotal)} more for FREE delivery
          </p>
        )}
      </CardContent>
    </Card>
  )
}
