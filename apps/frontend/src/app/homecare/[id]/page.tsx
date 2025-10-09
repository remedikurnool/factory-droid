'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star, Clock, Check, Shield, Award, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { homecareAPI } from '@/lib/api/homecare'
import { formatCurrency } from '@/lib/utils/format'
import type { HomecareService, ServicePricing } from '@/lib/types/homecare'
import { cn } from '@/lib/utils/cn'

const categoryColors: Record<string, string> = {
  NURSING: 'bg-blue-100 text-blue-800',
  PHYSIOTHERAPY: 'bg-purple-100 text-purple-800',
  DIABETES_CARE: 'bg-red-100 text-red-800',
  ELDERLY_CARE: 'bg-green-100 text-green-800',
  POST_SURGERY_CARE: 'bg-orange-100 text-orange-800',
  MEDICAL_EQUIPMENT: 'bg-cyan-100 text-cyan-800',
  LAB_SAMPLE_COLLECTION: 'bg-pink-100 text-pink-800',
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  const [service, setService] = useState<HomecareService | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPricing, setSelectedPricing] = useState<ServicePricing | null>(null)

  useEffect(() => {
    fetchService()
  }, [serviceId])

  const fetchService = async () => {
    setLoading(true)
    try {
      const data = await homecareAPI.getServiceById(serviceId)
      setService(data)
      if (data.pricingOptions.length > 0) {
        setSelectedPricing(data.pricingOptions[0])
      }
    } catch (error) {
      console.error('Error fetching service:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!selectedPricing) return
    router.push(`/homecare/${serviceId}/book?pricingId=${selectedPricing.id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-10 w-32" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="mb-4 h-64 w-full" />
            <Skeleton className="mb-2 h-8 w-3/4" />
            <Skeleton className="mb-4 h-4 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="mb-2 text-lg font-semibold">Service not found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              The service you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push('/homecare')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayPrice = selectedPricing
    ? selectedPricing.discountPrice || selectedPricing.price
    : 0
  const originalPrice = selectedPricing?.discountPrice
    ? selectedPricing.price
    : null
  const savings = originalPrice ? originalPrice - displayPrice : 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/homecare')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Services
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Service Image and Header */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="flex h-full items-center justify-center">
                  <div className="text-8xl">🏥</div>
                </div>
                <Badge
                  className={cn(
                    'absolute left-4 top-4',
                    categoryColors[service.category]
                  )}
                >
                  {service.category.replace(/_/g, ' ')}
                </Badge>
                {!service.available && (
                  <Badge className="absolute right-4 top-4 bg-red-600 text-white">
                    Currently Unavailable
                  </Badge>
                )}
              </div>

              <div className="p-6">
                <h1 className="mb-2 text-3xl font-bold">{service.name}</h1>
                {service.rating && (
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{service.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({service.totalReviews} reviews)
                    </span>
                  </div>
                )}
                <p className="text-muted-foreground">{service.shortDescription}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="description">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="included">What's Included</TabsTrigger>
                  <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-4">
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                </TabsContent>

                <TabsContent value="included" className="mt-4">
                  <div className="space-y-3">
                    {service.included.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  {service.equipmentProvided && service.equipmentProvided.length > 0 && (
                    <>
                      <h3 className="mt-6 mb-3 font-semibold">Equipment Provided</h3>
                      <div className="space-y-3">
                        {service.equipmentProvided.map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Check className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="qualifications" className="mt-4">
                  <h3 className="mb-3 font-semibold">Caretaker Qualifications</h3>
                  <div className="space-y-3">
                    {service.caretakerQualifications.map((qual, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Award className="mt-1 h-5 w-5 shrink-0 text-amber-600" />
                        <span>{qual}</span>
                      </div>
                    ))}
                  </div>
                  {service.availableFromTime && service.availableToTime && (
                    <>
                      <h3 className="mt-6 mb-3 font-semibold">Service Hours</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span>
                          Available from {service.availableFromTime} to{' '}
                          {service.availableToTime}
                        </span>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Select Plan</h2>

              {/* Pricing Options */}
              <RadioGroup
                value={selectedPricing?.id}
                onValueChange={(value) => {
                  const pricing = service.pricingOptions.find((p) => p.id === value)
                  if (pricing) setSelectedPricing(pricing)
                }}
                className="mb-6 space-y-3"
              >
                {service.pricingOptions.map((pricing) => {
                  const price = pricing.discountPrice || pricing.price
                  const hasDiscount = !!pricing.discountPrice
                  
                  return (
                    <div key={pricing.id} className="flex items-start gap-3">
                      <RadioGroupItem value={pricing.id} id={pricing.id} className="mt-1" />
                      <Label htmlFor={pricing.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {pricing.type === 'SESSION' && pricing.sessions
                                ? `${pricing.sessions} Sessions`
                                : pricing.type}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {pricing.description}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(price)}</div>
                            {hasDiscount && (
                              <div className="text-xs text-muted-foreground line-through">
                                {formatCurrency(pricing.price)}
                              </div>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>

              {/* Price Summary */}
              {selectedPricing && (
                <div className="mb-6 space-y-2 rounded-lg bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-medium">{formatCurrency(displayPrice)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span className="text-sm">Savings</span>
                      <span className="font-medium">- {formatCurrency(savings)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold">{formatCurrency(displayPrice)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleBookNow}
                disabled={!service.available || !selectedPricing}
              >
                {service.available ? (
                  <>
                    Book Now
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  'Currently Unavailable'
                )}
              </Button>

              {/* Features */}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>100% Verified Professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Background Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400" />
                  <span>Highly Rated Caretakers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
