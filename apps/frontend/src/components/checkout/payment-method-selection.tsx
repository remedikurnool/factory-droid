'use client'

import { CreditCard, Smartphone, Building2, Wallet, Banknote, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import type { PaymentMethod } from '@/lib/types/order'

interface PaymentMethodSelectionProps {
  selectedMethod?: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}

const paymentMethods = [
  {
    id: 'CARD' as PaymentMethod,
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, Rupay, Amex',
    icon: CreditCard,
    popular: true,
  },
  {
    id: 'UPI' as PaymentMethod,
    name: 'UPI',
    description: 'Google Pay, PhonePe, Paytm',
    icon: Smartphone,
    popular: true,
  },
  {
    id: 'NET_BANKING' as PaymentMethod,
    name: 'Net Banking',
    description: 'All major banks supported',
    icon: Building2,
    popular: false,
  },
  {
    id: 'WALLET' as PaymentMethod,
    name: 'Wallet',
    description: 'Paytm, PhonePe, Amazon Pay',
    icon: Wallet,
    popular: false,
  },
  {
    id: 'COD' as PaymentMethod,
    name: 'Cash on Delivery',
    description: 'Pay when you receive',
    icon: Banknote,
    popular: false,
  },
]

export function PaymentMethodSelection({
  selectedMethod,
  onSelect,
}: PaymentMethodSelectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Payment Method</h2>

      <div className="grid gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const isSelected = selectedMethod === method.id

          return (
            <Card
              key={method.id}
              className={cn(
                'cursor-pointer transition-colors hover:border-primary',
                isSelected && 'border-primary ring-2 ring-primary ring-offset-2'
              )}
              onClick={() => onSelect(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-lg bg-muted p-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{method.name}</h3>
                        {method.popular && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm">
          <strong>Note:</strong> Your payment information is secure and encrypted. We never store your card details.
        </p>
      </div>
    </div>
  )
}
