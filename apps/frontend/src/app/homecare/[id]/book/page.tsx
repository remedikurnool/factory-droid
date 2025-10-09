'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, User, FileText, CreditCard, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { homecareAPI } from '@/lib/api/homecare'
import { formatCurrency } from '@/lib/utils/format'
import type { HomecareService, ServicePricing, PatientDetails } from '@/lib/types/homecare'
import { cn } from '@/lib/utils/cn'

const steps = [
  { id: 1, name: 'Service Details', icon: FileText },
  { id: 2, name: 'Address', icon: MapPin },
  { id: 3, name: 'Schedule', icon: Calendar },
  { id: 4, name: 'Patient Details', icon: User },
  { id: 5, name: 'Payment', icon: CreditCard },
]

export default function BookServicePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = params.id as string
  const pricingId = searchParams.get('pricingId')

  const [currentStep, setCurrentStep] = useState(1)
  const [service, setService] = useState<HomecareService | null>(null)
  const [selectedPricing, setSelectedPricing] = useState<ServicePricing | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    name: '',
    age: 0,
    gender: 'MALE',
    contactNumber: '',
    medicalCondition: '',
    specialRequirements: '',
  })
  const [specialRequirements, setSpecialRequirements] = useState('')

  useEffect(() => {
    fetchService()
  }, [serviceId])

  const fetchService = async () => {
    setLoading(true)
    try {
      const data = await homecareAPI.getServiceById(serviceId)
      setService(data)
      
      const pricing = data.pricingOptions.find((p) => p.id === pricingId)
      if (pricing) {
        setSelectedPricing(pricing)
      }
    } catch (error) {
      console.error('Error fetching service:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    // Validate current step
    if (!validateCurrentStep()) {
      return
    }
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 2:
        if (!selectedAddressId) {
          alert('Please select an address')
          return false
        }
        break
      case 3:
        if (!startDate || !startTime) {
          alert('Please select date and time')
          return false
        }
        break
      case 4:
        if (!patientDetails.name || !patientDetails.age || !patientDetails.contactNumber) {
          alert('Please fill all required patient details')
          return false
        }
        break
    }
    return true
  }

  const handleBooking = async () => {
    if (!selectedPricing || !selectedAddressId) return

    try {
      const booking = await homecareAPI.createBooking({
        serviceId,
        pricingOptionId: selectedPricing.id,
        patientDetails,
        addressId: selectedAddressId,
        startDate,
        startTime,
        specialRequirements,
      })

      router.push(`/homecare/bookings/${booking.id}?new=true`)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    }
  }

  if (loading || !service || !selectedPricing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  const displayPrice = selectedPricing.discountPrice || selectedPricing.price

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push(`/homecare/${serviceId}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Service
      </Button>

      <h1 className="mb-6 text-3xl font-bold">Book {service.name}</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Steps Navigation */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-1 items-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        currentStep > step.id
                          ? 'bg-green-600 text-white'
                          : currentStep === step.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-2 hidden md:block">
                      <div
                        className={cn(
                          'text-sm font-medium',
                          currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {step.name}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'mx-4 h-0.5 flex-1',
                          currentStep > step.id ? 'bg-green-600' : 'bg-muted'
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].name}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Step 1: Service Details (Summary) */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    You've selected the following service:
                  </p>
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">{service.name}</h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {service.shortDescription}
                    </p>
                    <Badge>
                      {selectedPricing.type === 'SESSION' && selectedPricing.sessions
                        ? `${selectedPricing.sessions} Sessions`
                        : selectedPricing.type}
                    </Badge>
                  </div>
                  <Button onClick={handleNext} className="w-full">
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 2: Address Selection */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <Label>Select Address</Label>
                  <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                    {/* Mock addresses - In real app, fetch from user's saved addresses */}
                    <div className="flex items-start gap-3 rounded-lg border p-4">
                      <RadioGroupItem value="address-1" id="address-1" />
                      <Label htmlFor="address-1" className="flex-1 cursor-pointer">
                        <div className="font-medium">Home</div>
                        <div className="text-sm text-muted-foreground">
                          123 Main St, Apartment 4B, City, State 12345
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border p-4">
                      <RadioGroupItem value="address-2" id="address-2" />
                      <Label htmlFor="address-2" className="flex-1 cursor-pointer">
                        <div className="font-medium">Office</div>
                        <div className="text-sm text-muted-foreground">
                          456 Business Blvd, Suite 200, City, State 12345
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                  <Button variant="outline" className="w-full">
                    + Add New Address
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBack} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleNext} className="flex-1">
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBack} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleNext} className="flex-1">
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Patient Details */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      value={patientDetails.name}
                      onChange={(e) =>
                        setPatientDetails({ ...patientDetails, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={patientDetails.age || ''}
                        onChange={(e) =>
                          setPatientDetails({
                            ...patientDetails,
                            age: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        value={patientDetails.gender}
                        onValueChange={(value: any) =>
                          setPatientDetails({ ...patientDetails, gender: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      value={patientDetails.contactNumber}
                      onChange={(e) =>
                        setPatientDetails({
                          ...patientDetails,
                          contactNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="medicalCondition">Medical Condition (Optional)</Label>
                    <Textarea
                      id="medicalCondition"
                      value={patientDetails.medicalCondition}
                      onChange={(e) =>
                        setPatientDetails({
                          ...patientDetails,
                          medicalCondition: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialRequirements">
                      Special Requirements (Optional)
                    </Label>
                    <Textarea
                      id="specialRequirements"
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      rows={3}
                      placeholder="Any specific requirements or instructions..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBack} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleNext} className="flex-1">
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Payment */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">Review and confirm your booking</p>
                  <div className="rounded-lg border p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span className="font-medium">
                        {selectedPricing.type === 'SESSION' && selectedPricing.sessions
                          ? `${selectedPricing.sessions} Sessions`
                          : selectedPricing.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">{startTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Patient:</span>
                      <span className="font-medium">{patientDetails.name}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(displayPrice)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBack} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleBooking} className="flex-1">
                      Confirm & Pay
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Service</div>
                <div className="font-medium">{service.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Plan</div>
                <Badge>
                  {selectedPricing.type === 'SESSION' && selectedPricing.sessions
                    ? `${selectedPricing.sessions} Sessions`
                    : selectedPricing.type}
                </Badge>
              </div>
              {startDate && (
                <div>
                  <div className="text-sm text-muted-foreground">Date & Time</div>
                  <div className="font-medium">
                    {startDate} at {startTime}
                  </div>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(displayPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
