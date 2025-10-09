'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckoutStepper } from '@/components/checkout/checkout-stepper'
import { AddressSelection } from '@/components/checkout/address-selection'
import { DeliverySlotSelection } from '@/components/checkout/delivery-slot-selection'
import { PaymentMethodSelection } from '@/components/checkout/payment-method-selection'
import { OrderReview } from '@/components/checkout/order-review'
import { OrderSummary } from '@/components/checkout/order-summary'
import { useCartStore } from '@/lib/store/cart-store'
import { orderAPI } from '@/lib/api/orders'
import type { DeliverySlot, PaymentMethod, CheckoutState } from '@/lib/types/order'

const steps = [
  { id: 1, title: 'Address', description: 'Delivery address' },
  { id: 2, title: 'Delivery', description: 'Time slot' },
  { id: 3, title: 'Payment', description: 'Payment method' },
  { id: 4, title: 'Review', description: 'Order review' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const cart = useCartStore()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  const [state, setState] = useState<CheckoutState>({
    step: 1,
    selectedAddressId: undefined,
    selectedDeliverySlot: undefined,
    selectedPaymentMethod: undefined,
    couponCode: undefined,
    couponDiscount: 0,
    notes: undefined,
    prescriptionFile: undefined,
  })

  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null)

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push('/medicines')
    }
  }, [cart.items, router])

  // Fetch address when selected
  useEffect(() => {
    if (state.selectedAddressId) {
      orderAPI.getAddressById(state.selectedAddressId)
        .then(setSelectedAddress)
        .catch(console.error)
    }
  }, [state.selectedAddressId])

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!state.selectedAddressId
      case 2:
        return true // Delivery slot is optional
      case 3:
        return !!state.selectedPaymentMethod
      case 4:
        return state.step === 4 && !!state.selectedAddressId && !!state.selectedPaymentMethod
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(currentStep + 1)
      setState({ ...state, step: currentStep + 1 })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setState({ ...state, step: currentStep - 1 })
    }
  }

  const handlePlaceOrder = async () => {
    if (!state.selectedAddressId || !state.selectedPaymentMethod || !selectedAddress) {
      alert('Please complete all required fields')
      return
    }

    setLoading(true)
    try {
      const order = await orderAPI.createOrder({
        addressId: state.selectedAddressId,
        deliverySlotId: state.selectedDeliverySlot?.id,
        paymentMethod: state.selectedPaymentMethod,
        couponCode: state.couponCode,
        notes: state.notes,
      })

      // Clear cart
      cart.clearCart()

      // Redirect to order confirmation
      router.push(`/orders/${order.id}?new=true`)
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const hasPrescriptionItems = cart.items.some(
    (item) => item.medicine.prescriptionRequired
  )

  const tax = Math.round(cart.subtotal * 0.18) // 18% GST

  if (cart.items.length === 0) {
    return null // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Complete your order in {4 - currentStep + 1} simple steps
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <CheckoutStepper currentStep={currentStep} steps={steps} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <AddressSelection
                selectedAddressId={state.selectedAddressId}
                onSelect={(id) =>
                  setState({ ...state, selectedAddressId: id })
                }
              />
            )}

            {/* Step 2: Delivery Slot */}
            {currentStep === 2 && (
              <DeliverySlotSelection
                selectedSlot={state.selectedDeliverySlot}
                onSelect={(slot) =>
                  setState({ ...state, selectedDeliverySlot: slot })
                }
              />
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 3 && (
              <PaymentMethodSelection
                selectedMethod={state.selectedPaymentMethod}
                onSelect={(method) =>
                  setState({ ...state, selectedPaymentMethod: method })
                }
              />
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && selectedAddress && state.selectedPaymentMethod && (
              <OrderReview
                address={selectedAddress}
                deliverySlot={state.selectedDeliverySlot}
                paymentMethod={state.selectedPaymentMethod}
                itemCount={cart.totalItems}
                subtotal={cart.subtotal}
                discount={cart.discount}
                couponDiscount={state.couponDiscount}
                deliveryFee={cart.deliveryFee}
                tax={tax}
                total={cart.total + tax - state.couponDiscount}
                hasPrescriptionItems={hasPrescriptionItems}
                termsAccepted={state.step === 4}
                onTermsChange={(accepted) =>
                  setState({ ...state, step: accepted ? 4 : 3 })
                }
              />
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex gap-3">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={!canProceed() || loading}
                  className="flex-1"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <OrderSummary
              couponDiscount={state.couponDiscount}
              tax={tax}
              showItems={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
