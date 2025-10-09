'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Shield, CheckCircle, TrendingUp, Star, Building2, Users, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { insuranceAPI } from '@/lib/api/insurance'
import type { InsurancePlan, InsurancePlanType } from '@/lib/types/insurance'
import { cn } from '@/lib/utils/cn'

const planTypes: Array<{ value: InsurancePlanType; label: string }> = [
  { value: 'HEALTH', label: 'Health Insurance' },
  { value: 'CRITICAL_ILLNESS', label: 'Critical Illness' },
  { value: 'PERSONAL_ACCIDENT', label: 'Personal Accident' },
  { value: 'TOP_UP', label: 'Top-Up Plans' },
  { value: 'FAMILY_FLOATER', label: 'Family Floater' },
  { value: 'SENIOR_CITIZEN', label: 'Senior Citizen' },
]

export default function InsurancePlansPage() {
  const [plans, setPlans] = useState<InsurancePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<InsurancePlanType[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [sumInsuredRange, setSumInsuredRange] = useState<[number, number]>([300000, 10000000])
  const [premiumRange, setPremiumRange] = useState<[number, number]>([5000, 50000])
  const [sortBy, setSortBy] = useState<string>('PREMIUM_LOW_HIGH')
  const [showPopularOnly, setShowPopularOnly] = useState(false)
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false)
  const [compareList, setCompareList] = useState<string[]>([])

  useEffect(() => {
    fetchPlans()
  }, [selectedTypes, sortBy, showPopularOnly, showRecommendedOnly])

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const response = await insuranceAPI.searchPlans({
        type: selectedTypes[0],
        minSumInsured: sumInsuredRange[0],
        maxSumInsured: sumInsuredRange[1],
        minPremium: premiumRange[0],
        maxPremium: premiumRange[1],
        popular: showPopularOnly || undefined,
        recommended: showRecommendedOnly || undefined,
        sort: sortBy as any,
        limit: 50,
      })
      setPlans(response.plans)
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.insuranceCompany.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const togglePlanType = (type: InsurancePlanType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const toggleCompare = (planId: string) => {
    setCompareList((prev) => {
      if (prev.includes(planId)) {
        return prev.filter((id) => id !== planId)
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 plans at a time')
        return prev
      }
      return [...prev, planId]
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const PlanCard = ({ plan }: { plan: InsurancePlan }) => {
    const isInCompare = compareList.includes(plan.id)

    return (
      <Card className={cn('group cursor-pointer transition-all hover:shadow-lg', isInCompare && 'border-primary')}>
        <CardContent className="p-6">
          {/* Company & Badges */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  {plan.insuranceCompany.name}
                </h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{plan.insuranceCompany.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    • {plan.insuranceCompany.claimSettlementRatio}% CSR
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {plan.popular && (
                <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>
              )}
              {plan.recommended && (
                <Badge className="bg-green-100 text-green-800 text-xs">Recommended</Badge>
              )}
              {plan.bestValue && (
                <Badge className="bg-blue-100 text-blue-800 text-xs">Best Value</Badge>
              )}
            </div>
          </div>

          {/* Plan Name */}
          <Link href={`/insurance/${plan.id}`}>
            <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {plan.name}
            </h2>
          </Link>

          {/* Short Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{plan.shortDescription}</p>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sum Insured (up to)</p>
              <p className="font-semibold">{formatCurrency(Math.max(...plan.sumInsured))}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Premium (starting)</p>
              <p className="font-semibold text-primary">{formatCurrency(plan.premiumRange.min)}/year</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <span>{plan.networkHospitals.toLocaleString()}+ Network Hospitals</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <span>Room Rent: {plan.roomRentLimit}</span>
            </div>
            {plan.maternityCover && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                <span>Maternity Cover Included</span>
              </div>
            )}
            {plan.features.slice(0, 2).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                <span className="line-clamp-1">{feature}</span>
              </div>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-sm">{plan.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground">({plan.reviewCount} reviews)</span>
            {plan.taxBenefit && (
              <Badge variant="outline" className="ml-auto text-xs">
                Tax Benefit ₹46,800
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={`/insurance/${plan.id}`}>View Details</Link>
            </Button>
            <Button
              variant={isInCompare ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCompare(plan.id)}
            >
              {isInCompare ? 'Added' : 'Compare'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Health Insurance Plans
        </h1>
        <p className="mt-2 text-muted-foreground">
          Compare and buy the best health insurance plans for you and your family
        </p>
      </div>

      {/* Search & Quick Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search insurance plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={showPopularOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowPopularOnly(!showPopularOnly)}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Popular
              </Button>
              <Button
                variant={showRecommendedOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowRecommendedOnly(!showRecommendedOnly)}
              >
                <Star className="mr-2 h-4 w-4" />
                Recommended
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PREMIUM_LOW_HIGH">Premium: Low to High</SelectItem>
                  <SelectItem value="PREMIUM_HIGH_LOW">Premium: High to Low</SelectItem>
                  <SelectItem value="RATING_HIGH_LOW">Rating: High to Low</SelectItem>
                  <SelectItem value="SUM_INSURED_HIGH_LOW">Sum Insured: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1 h-fit sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Types */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Plan Type</Label>
              <div className="space-y-2">
                {planTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={() => togglePlanType(type.value)}
                    />
                    <Label htmlFor={type.value} className="text-sm font-normal cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sum Insured */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">
                Sum Insured: {formatCurrency(sumInsuredRange[0])} - {formatCurrency(sumInsuredRange[1])}
              </Label>
              <Slider
                value={sumInsuredRange}
                onValueChange={(value) => setSumInsuredRange(value as [number, number])}
                min={100000}
                max={20000000}
                step={100000}
                className="mt-2"
              />
            </div>

            {/* Premium */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">
                Premium: {formatCurrency(premiumRange[0])} - {formatCurrency(premiumRange[1])}
              </Label>
              <Slider
                value={premiumRange}
                onValueChange={(value) => setPremiumRange(value as [number, number])}
                min={1000}
                max={100000}
                step={1000}
                className="mt-2"
              />
            </div>

            <Button variant="outline" className="w-full" onClick={fetchPlans}>
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="lg:col-span-3">
          {/* Compare Bar */}
          {compareList.length > 0 && (
            <Card className="mb-6 bg-primary text-primary-foreground">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{compareList.length} plan(s) selected for comparison</p>
                    <p className="text-sm opacity-90">Select up to 3 plans to compare</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setCompareList([])}>
                      Clear
                    </Button>
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/insurance/compare?plans=${compareList.join(',')}`}>
                        Compare Now
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plans List */}
          {loading ? (
            <div className="grid gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="mb-4 h-12 w-full" />
                    <Skeleton className="mb-2 h-6 w-3/4" />
                    <Skeleton className="mb-4 h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPlans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="mb-2 text-lg font-semibold">No plans found</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('')
                  setSelectedTypes([])
                  setShowPopularOnly(false)
                  setShowRecommendedOnly(false)
                }}>
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Found {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''}
              </div>
              <div className="grid gap-6">
                {filteredPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tax Benefit Banner */}
      <Card className="mt-8 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <TrendingUp className="h-8 w-8 text-green-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Tax Benefits up to ₹46,800</h3>
              <p className="text-sm text-green-800">
                Save up to ₹46,800 in taxes under Section 80D when you buy health insurance.
                Premium paid for self, spouse, children, and parents are eligible for deduction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
