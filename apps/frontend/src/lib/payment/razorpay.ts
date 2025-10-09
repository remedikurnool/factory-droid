/**
 * Razorpay Payment Integration
 * Handles payment initiation, verification, and error handling
 */

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  orderId: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface PaymentInitiateRequest {
  orderId: string
  amount: number
  currency?: string
}

export interface PaymentInitiateResponse {
  razorpayOrderId: string
  amount: number
  currency: string
  key: string
}

export interface PaymentVerifyRequest {
  orderId: string
  razorpayPaymentId: string
  razorpayOrderId: string
  razorpaySignature: string
}

export interface PaymentVerifyResponse {
  success: boolean
  orderId: string
  paymentId: string
  status: 'SUCCESS' | 'FAILED'
  message?: string
}

/**
 * Load Razorpay script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    // Check if already loaded
    if ((window as any).Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true

    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)

    document.body.appendChild(script)
  })
}

/**
 * Display Razorpay payment modal
 */
export const displayRazorpay = async (
  options: RazorpayOptions,
  onSuccess: (response: RazorpayResponse) => void,
  onFailure: (error: any) => void
): Promise<void> => {
  const scriptLoaded = await loadRazorpayScript()

  if (!scriptLoaded) {
    onFailure(new Error('Failed to load Razorpay SDK'))
    return
  }

  const Razorpay = (window as any).Razorpay

  const razorpayOptions = {
    key: options.key,
    amount: options.amount, // Amount in paise
    currency: options.currency,
    name: options.name,
    description: options.description,
    order_id: options.orderId,
    prefill: options.prefill,
    theme: {
      color: options.theme?.color || '#0070f3',
    },
    handler: (response: RazorpayResponse) => {
      onSuccess(response)
    },
    modal: {
      ondismiss: () => {
        options.modal?.ondismiss?.()
      },
    },
  }

  const paymentObject = new Razorpay(razorpayOptions)

  paymentObject.on('payment.failed', (response: any) => {
    onFailure(response.error)
  })

  paymentObject.open()
}

/**
 * Format amount to paise (smallest currency unit)
 * Razorpay expects amount in paise (1 INR = 100 paise)
 */
export const formatAmountToPaise = (amount: number): number => {
  return Math.round(amount * 100)
}

/**
 * Format amount from paise to rupees
 */
export const formatAmountFromPaise = (amount: number): number => {
  return amount / 100
}

/**
 * Get payment status color
 */
export const getPaymentStatusColor = (
  status: string
): { bg: string; text: string } => {
  switch (status) {
    case 'SUCCESS':
    case 'PAID':
      return { bg: 'bg-green-100', text: 'text-green-800' }
    case 'PENDING':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800' }
    case 'FAILED':
    case 'CANCELLED':
      return { bg: 'bg-red-100', text: 'text-red-800' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' }
  }
}

/**
 * Get payment method display name
 */
export const getPaymentMethodDisplay = (method: string): string => {
  const methods: Record<string, string> = {
    CARD: 'Credit/Debit Card',
    UPI: 'UPI',
    NET_BANKING: 'Net Banking',
    WALLET: 'Wallet',
    COD: 'Cash on Delivery',
  }
  return methods[method] || method
}
