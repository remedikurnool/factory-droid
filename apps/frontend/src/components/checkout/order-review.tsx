'use client'

import { MapPin, Clock, CreditCard, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/format'
import type { Address, DeliverySlot, PaymentMethod } from '@/lib/types/order'

interface OrderReviewProps {
  address: Address
  deliverySlot?: DeliverySlot
  paymentMethod: PaymentMethod
  itemCount: number
  subtotal: number
  discount: number
  couponDiscount: number
  deliveryFee: number
  tax: number
  total: number
  hasPrescriptionItems: boolean
  termsAccepted: boolean
  onTermsChange: (accepted: boolean) => void
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CARD: 'Credit/Debit Card',
  UPI: 'UPI',
  NET_BANKING: 'Net Banking',
  WALLET: 'Wallet',
  COD: 'Cash on Delivery',
}

export function OrderReview({
  address,
  deliverySlot,
  paymentMethod,
  itemCount,
  subtotal,
  discount,
  couponDiscount,
  deliveryFee,
  tax,
  total,
  hasPrescriptionItems,
  termsAccepted,
  onTermsChange,
}: OrderReviewProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Review Your Order</h2>

      {/* Prescription Warning */}
      {hasPrescriptionItems && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-900">Prescription Required</p>
            <p className="mt-1 text-sm text-amber-700">
              You will need to upload a valid prescription after placing the order.
              Our team will verify it before dispatching your order.
            </p>
          </div>
        </div>
      )}

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="font-semibold">{address.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {address.addressLine1}
              {address.addressLine2 && `, ${address.addressLine2}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {address.city}, {address.state} - {address.pincode}
            </p>
            {address.landmark && (
              <p className="text-sm text-muted-foreground">
                Landmark: {address.landmark}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Phone: {address.phoneNumber}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Slot */}
      {deliverySlot && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5" />
              Delivery Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{deliverySlot.slotLabel}</p>
            <p className="text-sm text-muted-foreground">
              {deliverySlot.date} • {deliverySlot.startTime} - {deliverySlot.endTime}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-semibold">{paymentMethodLabels[paymentMethod]}</p>
          {paymentMethod === 'COD' && (
            <p className="mt-1 text-sm text-muted-foreground">
              Pay when you receive your order
            </p>
          )}
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({itemCount} items)</span>
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
              <span className="text-lg">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <div className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={onTermsChange}
        />
        <div className="flex-1">
          <Label htmlFor="terms" className="cursor-pointer text-sm">
            I agree to the{' '}
            <a href="/terms" className="text-primary hover:underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            By placing this order, you agree to our terms of service and return policy.
          </p>
        </div>
      </div>
    </div>
  )
}
