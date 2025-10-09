'use client'

import { useState } from 'react'
import { Loader2, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  displayRazorpay,
  formatAmountToPaise,
  type RazorpayResponse,
} from '@/lib/payment/razorpay'
import { paymentAPI } from '@/lib/api/payments'
import { formatCurrency } from '@/lib/utils/format'

interface RazorpayPaymentProps {
  orderId: string
  amount: number
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  onSuccess: (paymentId: string) => void
  onFailure: (error: Error) => void
  disabled?: boolean
}

export function RazorpayPayment({
  orderId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
  disabled = false,
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      // Step 1: Initiate payment on backend
      const paymentData = await paymentAPI.initiatePayment({
        orderId,
        amount,
        currency: 'INR',
      })

      // Step 2: Open Razorpay modal
      await displayRazorpay(
        {
          key: paymentData.key,
          amount: formatAmountToPaise(paymentData.amount),
          currency: paymentData.currency,
          name: 'Factory Droid Pharmacy',
          description: `Payment for Order #${orderId}`,
          orderId: paymentData.razorpayOrderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: '#0070f3',
          },
          modal: {
            ondismiss: () => {
              setLoading(false)
              setError('Payment cancelled by user')
            },
          },
        },
        async (response: RazorpayResponse) => {
          // Step 3: Verify payment on backend
          try {
            const verificationResult = await paymentAPI.verifyPayment({
              orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            })

            if (verificationResult.success) {
              setSuccess(true)
              onSuccess(verificationResult.paymentId)
            } else {
              throw new Error(verificationResult.message || 'Payment verification failed')
            }
          } catch (verifyError: any) {
            const errorMessage =
              verifyError.response?.data?.message ||
              verifyError.message ||
              'Payment verification failed'
            setError(errorMessage)
            onFailure(new Error(errorMessage))
          } finally {
            setLoading(false)
          }
        },
        (error: any) => {
          // Payment failed
          const errorMessage =
            error.description || error.message || 'Payment failed'
          setError(errorMessage)
          onFailure(new Error(errorMessage))
          setLoading(false)
        }
      )
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to initiate payment'
      setError(errorMessage)
      onFailure(new Error(errorMessage))
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Payment successful! Your order is being processed.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Amount to Pay</span>
          <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Secure payment powered by Razorpay
        </p>
      </div>

      <Button
        onClick={handlePayment}
        disabled={disabled || loading || success}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Payment Completed
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay {formatCurrency(amount)}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>🔒</span>
        <span>Your payment information is secure and encrypted</span>
      </div>
    </div>
  )
}
