'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Step {
  id: number
  title: string
  description: string
}

interface CheckoutStepperProps {
  currentStep: number
  steps: Step[]
}

export function CheckoutStepper({ currentStep, steps }: CheckoutStepperProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isLast = index === steps.length - 1

          return (
            <li
              key={step.id}
              className={cn('flex items-center', !isLast && 'flex-1')}
            >
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    isCompleted &&
                      'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-background text-primary',
                    !isCompleted &&
                      !isCurrent &&
                      'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="hidden text-xs text-muted-foreground sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Line */}
              {!isLast && (
                <div
                  className={cn(
                    'mx-4 h-[2px] flex-1 transition-colors',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
