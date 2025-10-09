'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ambulance, MapPin, User, Phone, AlertTriangle, Clock, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { emergencyAPI } from '@/lib/api/emergency'
import { formatCurrency } from '@/lib/utils/format'
import type { AmbulanceType, PatientCondition, AmbulanceCostEstimate } from '@/lib/types/emergency'
import { cn } from '@/lib/utils/cn'

const ambulanceTypes: Array<{
  type: AmbulanceType
  label: string
  description: string
  features: string[]
}> = [
  {
    type: 'BASIC',
    label: 'Basic Ambulance',
    description: 'Standard ambulance with basic medical equipment',
    features: ['First Aid Kit', 'Oxygen Cylinder', 'Stretcher', 'Trained Staff'],
  },
  {
    type: 'ADVANCED',
    label: 'Advanced Life Support (ALS)',
    description: 'Equipped with advanced life support equipment',
    features: [
      'Cardiac Monitor',
      'Defibrillator',
      'Advanced Medications',
      'Ventilator',
      'Paramedic Staff',
    ],
  },
  {
    type: 'ICU',
    label: 'ICU Ambulance',
    description: 'Mobile ICU with critical care equipment',
    features: [
      'Complete ICU Setup',
      'Ventilator',
      'Infusion Pumps',
      'Cardiac Monitor',
      'Trained ICU Nurse',
      'Emergency Doctor (on request)',
    ],
  },
]

const patientConditions: Array<{
  value: PatientCondition
  label: string
  color: string
}> = [
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-600' },
  { value: 'SERIOUS', label: 'Serious', color: 'bg-orange-600' },
  { value: 'MODERATE', label: 'Moderate', color: 'bg-yellow-600' },
  { value: 'STABLE', label: 'Stable', color: 'bg-green-600' },
  { value: 'UNKNOWN', label: 'Unknown', color: 'bg-gray-600' },
]

export default function AmbulanceBookingPage() {
  const router = useRouter()
  
  // Form state
  const [selectedType, setSelectedType] = useState<AmbulanceType>('BASIC')
  const [pickupAddress, setPickupAddress] = useState('')
  const [pickupLandmark, setPickupLandmark] = useState('')
  const [pickupPincode, setPickupPincode] = useState('')
  const [dropAddress, setDropAddress] = useState('')
  const [dropLandmark, setDropLandmark] = useState('')
  const [dropPincode, setDropPincode] = useState('')
  const [patientName, setPatientName] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [patientGender, setPatientGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE')
  const [patientCondition, setPatientCondition] = useState<PatientCondition>('UNKNOWN')
  const [medicalNotes, setMedicalNotes] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyNumber, setEmergencyNumber] = useState('')
  
  // UI state
  const [estimate, setEstimate] = useState<AmbulanceCostEstimate | null>(null)
  const [loading, setLoading] = useState(false)
  const [estimateLoading, setEstimateLoading] = useState(false)

  const handleGetEstimate = async () => {
    if (!pickupAddress || !dropAddress) {
      alert('Please enter pickup and drop locations')
      return
    }

    setEstimateLoading(true)
    try {
      // Mock location coordinates - in production, use geocoding API
      const estimateData = await emergencyAPI.getAmbulanceCostEstimate({
        ambulanceType: selectedType,
        pickupLocation: {
          latitude: 0,
          longitude: 0,
          address: pickupAddress,
          landmark: pickupLandmark,
          pincode: pickupPincode,
        },
        dropLocation: {
          latitude: 0,
          longitude: 0,
          address: dropAddress,
          landmark: dropLandmark,
          pincode: dropPincode,
        },
      })
      setEstimate(estimateData)
    } catch (error) {
      console.error('Error getting estimate:', error)
      alert('Failed to get estimate. Please try again.')
    } finally {
      setEstimateLoading(false)
    }
  }

  const handleBookAmbulance = async () => {
    // Validation
    if (!pickupAddress || !dropAddress) {
      alert('Please enter pickup and drop locations')
      return
    }
    if (!patientName || !patientAge) {
      alert('Please enter patient details')
      return
    }
    if (!emergencyName || !emergencyNumber) {
      alert('Please enter emergency contact details')
      return
    }

    setLoading(true)
    try {
      const booking = await emergencyAPI.bookAmbulance({
        ambulanceType: selectedType,
        pickupLocation: {
          latitude: 0,
          longitude: 0,
          address: pickupAddress,
          landmark: pickupLandmark,
          pincode: pickupPincode,
        },
        dropLocation: {
          latitude: 0,
          longitude: 0,
          address: dropAddress,
          landmark: dropLandmark,
          pincode: dropPincode,
        },
        patientName,
        patientAge: parseInt(patientAge),
        patientGender,
        patientCondition,
        medicalNotes,
        emergencyContactName: emergencyName,
        emergencyContactNumber: emergencyNumber,
      })

      // Redirect to booking confirmation
      router.push(`/emergency/ambulance/bookings/${booking.id}?new=true`)
    } catch (error) {
      console.error('Error booking ambulance:', error)
      alert('Failed to book ambulance. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Emergency Header */}
      <div className="mb-6 flex items-center gap-4 rounded-lg border-2 border-red-600 bg-red-50 p-4">
        <AlertTriangle className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold text-red-900">Emergency Ambulance Service</h1>
          <p className="text-sm text-red-700">
            For life-threatening emergencies, call 108 immediately
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ambulance Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ambulance className="h-5 w-5" />
                Select Ambulance Type
              </CardTitle>
              <CardDescription>Choose the type based on patient condition</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <div className="space-y-4">
                  {ambulanceTypes.map((ambulance) => (
                    <div
                      key={ambulance.type}
                      className={cn(
                        'relative flex gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all',
                        selectedType === ambulance.type
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <RadioGroupItem value={ambulance.type} id={ambulance.type} className="mt-1" />
                      <Label htmlFor={ambulance.type} className="flex-1 cursor-pointer">
                        <div className="mb-1 font-semibold">{ambulance.label}</div>
                        <div className="mb-2 text-sm text-muted-foreground">
                          {ambulance.description}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {ambulance.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Pickup Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Pickup Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pickupAddress">Address *</Label>
                <Textarea
                  id="pickupAddress"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Enter complete pickup address"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupLandmark">Landmark</Label>
                  <Input
                    id="pickupLandmark"
                    value={pickupLandmark}
                    onChange={(e) => setPickupLandmark(e.target.value)}
                    placeholder="Nearby landmark"
                  />
                </div>
                <div>
                  <Label htmlFor="pickupPincode">Pincode *</Label>
                  <Input
                    id="pickupPincode"
                    value={pickupPincode}
                    onChange={(e) => setPickupPincode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                <MapPin className="mr-2 h-4 w-4" />
                Use Current Location
              </Button>
            </CardContent>
          </Card>

          {/* Drop Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Drop Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dropAddress">Address *</Label>
                <Textarea
                  id="dropAddress"
                  value={dropAddress}
                  onChange={(e) => setDropAddress(e.target.value)}
                  placeholder="Enter complete drop address (hospital/clinic)"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dropLandmark">Landmark</Label>
                  <Input
                    id="dropLandmark"
                    value={dropLandmark}
                    onChange={(e) => setDropLandmark(e.target.value)}
                    placeholder="Nearby landmark"
                  />
                </div>
                <div>
                  <Label htmlFor="dropPincode">Pincode *</Label>
                  <Input
                    id="dropPincode"
                    value={dropPincode}
                    onChange={(e) => setDropPincode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="patientAge">Age *</Label>
                  <Input
                    id="patientAge"
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="Age"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="patientGender">Gender *</Label>
                <Select value={patientGender} onValueChange={(value: any) => setPatientGender(value)}>
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
              <div>
                <Label>Patient Condition *</Label>
                <RadioGroup
                  value={patientCondition}
                  onValueChange={(value: any) => setPatientCondition(value)}
                  className="grid grid-cols-2 gap-2 mt-2"
                >
                  {patientConditions.map((condition) => (
                    <div key={condition.value} className="flex items-center gap-2">
                      <RadioGroupItem value={condition.value} id={condition.value} />
                      <Label htmlFor={condition.value} className="flex items-center gap-2 cursor-pointer">
                        <div className={cn('h-3 w-3 rounded-full', condition.color)} />
                        {condition.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="medicalNotes">Medical Notes (Optional)</Label>
                <Textarea
                  id="medicalNotes"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Brief description of condition, symptoms, or special requirements"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emergencyName">Contact Name *</Label>
                <Input
                  id="emergencyName"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Name of emergency contact person"
                />
              </div>
              <div>
                <Label htmlFor="emergencyNumber">Contact Number *</Label>
                <Input
                  id="emergencyNumber"
                  type="tel"
                  value={emergencyNumber}
                  onChange={(e) => setEmergencyNumber(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  maxLength={15}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            {/* Cost Estimate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Cost Estimate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGetEstimate}
                  disabled={estimateLoading || !pickupAddress || !dropAddress}
                >
                  {estimateLoading ? 'Calculating...' : 'Get Estimate'}
                </Button>

                {estimate && (
                  <div className="space-y-3 rounded-lg border p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-medium">{estimate.distance} km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Fare</span>
                      <span className="font-medium">{formatCurrency(estimate.baseFare)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Per KM Charge</span>
                      <span className="font-medium">{formatCurrency(estimate.perKmCharge)}/km</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">Estimated Cost</span>
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(estimate.estimatedCost)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Estimated Time: {estimate.estimatedTime} mins</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Book Button */}
            <Card>
              <CardContent className="p-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBookAmbulance}
                  disabled={loading}
                >
                  {loading ? 'Booking...' : 'Book Ambulance Now'}
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Our team will contact you within 2 minutes
                </p>
              </CardContent>
            </Card>

            {/* Emergency Numbers */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900">Emergency Numbers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="destructive" className="w-full justify-start" asChild>
                  <a href="tel:108">
                    <Phone className="mr-2 h-4 w-4" />
                    108 - Ambulance
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="tel:102">
                    <Phone className="mr-2 h-4 w-4" />
                    102 - Medical Helpline
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
