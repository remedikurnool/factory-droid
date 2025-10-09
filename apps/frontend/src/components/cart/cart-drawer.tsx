'use client'

import { ShoppingCart, Minus, Plus, X, Trash2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCartStore } from '@/lib/store/cart-store'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

export function CartDrawer() {
  const cart = useCartStore()
  const {
    items,
    totalItems,
    subtotal,
    discount,
    deliveryFee,
    total,
    updateQuantity,
    removeItem,
  } = cart

  const hasItems = items.length > 0
  const hasPrescriptionItems = items.some((item) => item.medicine.prescriptionRequired)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {totalItems}
            </Badge>
          )}
          <span className="sr-only">Shopping cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {hasItems
              ? `${totalItems} ${totalItems === 1 ? 'item' : 'items'} in your cart`
              : 'Your cart is empty'}
          </SheetDescription>
        </SheetHeader>

        {hasItems ? (
          <>
            {/* Prescription Warning */}
            {hasPrescriptionItems && (
              <div className="mx-1 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">
                    Prescription Required
                  </p>
                  <p className="mt-1 text-amber-700">
                    Some items require a valid prescription. You'll be able to
                    upload it during checkout.
                  </p>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto pr-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border p-3"
                  >
                    {/* Product Image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {item.medicine.images?.[0] ? (
                        <Image
                          src={item.medicine.images[0]}
                          alt={item.medicine.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <ShoppingCart className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-medium line-clamp-1">
                            {item.medicine.name}
                          </h4>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.medicine.brand?.name}
                          </p>
                          {item.medicine.prescriptionRequired && (
                            <Badge
                              variant="outline"
                              className="mt-1 text-xs"
                            >
                              ℞ Rx Required
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      </div>

                      {/* Quantity and Price */}
                      <div className="mt-2 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={
                              item.medicine.stockQuantity !== undefined &&
                              item.quantity >= item.medicine.stockQuantity
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatCurrency(item.medicine.sellingPrice * item.quantity)}
                          </p>
                          {item.medicine.discount > 0 && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatCurrency(item.medicine.mrp * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="space-y-4 border-t pt-4 pr-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
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
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {deliveryFee > 0 && subtotal < 500 && (
                <p className="text-xs text-muted-foreground">
                  Add {formatCurrency(500 - subtotal)} more for FREE delivery
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <SheetFooter className="pr-6">
              <Link href="/checkout" className="w-full">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </SheetFooter>
          </>
        ) : (
          /* Empty Cart */
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Your cart is empty</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add some medicines to get started
            </p>
            <Link href="/medicines" className="mt-6">
              <Button>Browse Medicines</Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
