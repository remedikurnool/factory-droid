'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Star,
  Building2,
  Users,
  FileText,
  Clock,
  TrendingUp,
  Hospital,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { insuranceAPI } from '@/lib/api/insurance'
import type { InsurancePlan } from '@/lib/types/insurance'

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [plan, setPlan] = useState<InsurancePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSumInsured, setSelectedSumInsured] = useState<number>(0)

  useEffect(() => {
    if (params.id) {
      fetchPlan(params.id as string)
    }
  }, [params.id])

  const fetchPlan = async (id: string) => {
    setLoading(true)
    try {
      const data = await insuranceAPI.getPlanById(id)
      setPlan(data)
      setSelectedSumInsured(data.sumInsured[0])
    } catch (error) {
      console.error('Error fetching plan:', error)
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="mb-6 h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="mb-2 text-lg font-semibold">Plan not found</h3>
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
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/insurance">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{plan.insuranceCompany.name}</p>
              <h1 className="text-3xl font-bold">{plan.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{plan.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({plan.reviewCount} reviews)</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="outline">{plan.insuranceCompany.claimSettlementRatio}% CSR</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {plan.popular && <Badge className="bg-orange-100 text-orange-800">Popular</Badge>}
            {plan.recommended && <Badge className="bg-green-100 text-green-800">Recommended</Badge>}
            {plan.bestValue && <Badge className="bg-blue-100 text-blue-800">Best Value</Badge>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              <p className="text-muted-foreground">{plan.description}</p>
            </CardContent>
          </Card>

          {/* Key Stats */}
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Card>
              <CardContent className="p-4">
                <Hospital className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold">{plan.networkHospitals.toLocaleString()}+</p>
                <p className="text-sm text-muted-foreground">Network Hospitals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold">{plan.claimProcess.averageSettlementTime}</p>
                <p className="text-sm text-muted-foreground">Claim Settlement</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold">{plan.insuranceCompany.claimSettlementRatio}%</p>
                <p className="text-sm text-muted-foreground">CSR Ratio</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="features" className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
              <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
              <TabsTrigger value="claims">Claim Process</TabsTrigger>
            </TabsList>

            <TabsContent value="features">
              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inclusions">
              <Card>
                <CardHeader>
                  <CardTitle>What's Covered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {plan.inclusions.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exclusions">
              <Card>
                <CardHeader>
                  <CardTitle>What's Not Covered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {plan.exclusions.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="claims">
              <Card>
                <CardHeader>
                  <CardTitle>How to Claim</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan.claimProcess.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p>{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-semibold mb-2">Required Documents</h4>
                    <ul className="space-y-1">
                      {plan.claimProcess.documents.map((doc, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Waiting Periods */}
          <Card>
            <CardHeader>
              <CardTitle>Waiting Periods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Initial</p>
                  <p className="text-lg font-semibold">{plan.waitingPeriod.initial} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pre-existing Diseases</p>
                  <p className="text-lg font-semibold">{plan.waitingPeriod.preExisting} months</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specific Diseases</p>
                  <p className="text-lg font-semibold">{plan.waitingPeriod.specificDiseases} years</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Get Instant Quote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sum Insured Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Sum Insured</label>
                <div className="grid gap-2">
                  {plan.sumInsured.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedSumInsured(amount)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedSumInsured === amount
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <p className="font-semibold">{formatCurrency(amount)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Premium Display */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Premium starting at</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(plan.premiumRange.min)}</p>
                <p className="text-xs text-muted-foreground mt-1">per year + GST</p>
              </div>

              {/* CTA Buttons */}
              <Button size="lg" className="w-full" asChild>
                <Link href={`/insurance/${plan.id}/buy`}>
                  Get Quote & Buy
                </Link>
              </Button>

              <Separator />

              {/* Quick Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Cashless in {plan.cashlessHospitals.toLocaleString()}+ hospitals</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Room Rent: {plan.roomRentLimit}</span>
                </div>
                {plan.maternityCover && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Maternity Cover Available</span>
                  </div>
                )}
                {plan.taxBenefit && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Tax benefits up to ₹46,800</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add-ons */}
          {plan.addOns.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Available Add-ons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.addOns.slice(0, 3).map((addon) => (
                    <div key={addon.id} className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{addon.name}</p>
                        <p className="text-xs text-muted-foreground">{addon.description}</p>
                      </div>
                      <p className="text-sm font-semibold text-primary whitespace-nowrap ml-2">
                        +{formatCurrency(addon.premium)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm mb-1">Need Help?</p>
                  <p className="text-xs text-blue-800 mb-2">
                    Our insurance experts are available to help you choose the right plan
                  </p>
                  <Button variant="outline" size="sm" className="text-xs">
                    Talk to Expert
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
