'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Building2, Star, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { insuranceAPI } from '@/lib/api/insurance'
import type { InsurancePlan } from '@/lib/types/insurance'
import { cn } from '@/lib/utils/cn'

function CompareContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [plans, setPlans] = useState<InsurancePlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const planIds = searchParams.get('plans')?.split(',') || []
    if (planIds.length === 0) {
      router.push('/insurance')
      return
    }
    fetchPlans(planIds)
  }, [searchParams])

  const fetchPlans = async (planIds: string[]) => {
    setLoading(true)
    try {
      const comparison = await insuranceAPI.comparePlans(planIds)
      setPlans(comparison.plans)
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const CompareRow = ({ label, values }: { label: string; values: (string | number | boolean)[] }) => {
    return (
      <div className="grid grid-cols-4 border-b last:border-b-0">
        <div className="p-4 font-medium bg-muted">{label}</div>
        {values.map((value, idx) => (
          <div key={idx} className="p-4 flex items-center justify-center">
            {typeof value === 'boolean' ? (
              value ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )
            ) : (
              <span className="text-center">{value}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-10 w-64" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="mb-4 h-20 w-full" />
            <Skeleton className="mb-4 h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="mb-2 text-lg font-semibold">No plans to compare</h3>
            <p className="mb-4 text-sm text-muted-foreground">Select plans from the insurance page to compare</p>
            <Button asChild>
              <Link href="/insurance">Browse Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/insurance">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Compare Insurance Plans</h1>
      </div>

      {/* Plan Headers */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="grid grid-cols-4">
            <div className="p-4"></div>
            {plans.map((plan) => (
              <div key={plan.id} className="p-6 border-l">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{plan.insuranceCompany.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{plan.insuranceCompany.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold mb-3 line-clamp-2">{plan.name}</h3>
                <div className="space-y-2 mb-4">
                  {plan.popular && <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>}
                  {plan.recommended && <Badge className="bg-green-100 text-green-800 text-xs">Recommended</Badge>}
                  {plan.bestValue && <Badge className="bg-blue-100 text-blue-800 text-xs">Best Value</Badge>}
                </div>
                <Button asChild className="w-full">
                  <Link href={`/insurance/${plan.id}`}>View Details</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage & Premium</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CompareRow
            label="Sum Insured (Maximum)"
            values={plans.map((p) => formatCurrency(Math.max(...p.sumInsured)))}
          />
          <CompareRow
            label="Premium (Starting)"
            values={plans.map((p) => formatCurrency(p.premiumRange.min))}
          />
          <CompareRow
            label="Premium Range"
            values={plans.map((p) => `${formatCurrency(p.premiumRange.min)} - ${formatCurrency(p.premiumRange.max)}`)}
          />
          <CompareRow label="Coverage Type" values={plans.map((p) => p.coverageType.replace(/_/g, ' '))} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Network & Claims</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CompareRow
            label="Network Hospitals"
            values={plans.map((p) => p.networkHospitals.toLocaleString())}
          />
          <CompareRow
            label="Cashless Hospitals"
            values={plans.map((p) => p.cashlessHospitals.toLocaleString())}
          />
          <CompareRow
            label="Claim Settlement Ratio"
            values={plans.map((p) => `${p.insuranceCompany.claimSettlementRatio}%`)}
          />
          <CompareRow
            label="Claim Settlement Time"
            values={plans.map((p) => p.claimProcess.averageSettlementTime)}
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Room Rent & Limits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CompareRow label="Room Rent Limit" values={plans.map((p) => p.roomRentLimit)} />
          <CompareRow label="Co-Payment" values={plans.map((p) => p.coPayment)} />
          <CompareRow label="Ambulance Charges" values={plans.map((p) => p.ambulanceCharges)} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Waiting Periods</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CompareRow
            label="Initial Waiting Period"
            values={plans.map((p) => `${p.waitingPeriod.initial} days`)}
          />
          <CompareRow
            label="Pre-existing Diseases"
            values={plans.map((p) => `${p.waitingPeriod.preExisting} months`)}
          />
          <CompareRow
            label="Specific Diseases"
            values={plans.map((p) => `${p.waitingPeriod.specificDiseases} years`)}
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Special Benefits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CompareRow label="Maternity Cover" values={plans.map((p) => p.maternityCover)} />
          <CompareRow label="Newborn Cover" values={plans.map((p) => p.newbornCover)} />
          <CompareRow label="Daycare Procedures" values={plans.map((p) => p.daycareProcedures)} />
          <CompareRow label="Pre Medical Checkup" values={plans.map((p) => p.preMedicalCheckup)} />
          <CompareRow label="Tax Benefits" values={plans.map((p) => p.taxBenefit)} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ratings & Reviews</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CompareRow label="Plan Rating" values={plans.map((p) => `${p.rating.toFixed(1)}/5`)} />
          <CompareRow label="Reviews" values={plans.map((p) => p.reviewCount)} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ComparePlansPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-10 w-64" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="mb-4 h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    }>
      <CompareContent />
    </Suspense>
  )
}
