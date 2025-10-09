'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Upload, CreditCard, Shield, FileText, Users, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { insuranceAPI } from '@/lib/api/insurance'
import type { InsurancePlan, InsuranceQuote, QuoteMember } from '@/lib/types/insurance'

const steps = [
  { id: 1, name: 'Get Quote', icon: Shield },
  { id: 2, name: 'Proposer Details', icon: Users },
  { id: 3, name: 'Nominee & Medical', icon: Heart },
  { id: 4, name: 'Documents', icon: FileText },
  { id: 5, name: 'Payment', icon: CreditCard },
]

export default function BuyInsurancePage() {
  const params = useParams()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [plan, setPlan] = useState<InsurancePlan | null>(null)
  const [quote, setQuote] = useState<InsuranceQuote | null>(null)
  const [loading, setLoading] = useState(true)

  // Step 1: Quote Data
  const [sumInsured, setSumInsured] = useState<number>(500000)
  const [policyTerm, setPolicyTerm] = useState<string>('1_YEAR')
  const [coverageType, setCoverageType] = useState<string>('INDIVIDUAL')
  const [members, setMembers] = useState<QuoteMember[]>([
    {
      relationship: 'SELF',
      dateOfBirth: '',
      gender: 'MALE',
    },
  ])

  // Step 2: Proposer Data
  const [proposer, setProposer] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    email: '',
    phoneNumber: '',
    address: {
      line1: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    idProofType: 'AADHAAR',
    idProofNumber: '',
    occupation: '',
    annualIncome: 0,
    panNumber: '',
  })

  // Step 3: Nominee & Medical
  const [nominee, setNominee] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    relationship: '',
    phoneNumber: '',
    isMinor: false,
  })

  const [medicalDeclaration, setMedicalDeclaration] = useState({
    hasChronicDisease: false,
    hasSurgery: false,
    hasHospitalization: false,
    takingMedication: false,
    hasAllergies: false,
    hasDisability: false,
    familyMedicalHistory: {
      hasDiabetes: false,
      hasHeartDisease: false,
      hasCancer: false,
      hasHypertension: false,
    },
  })

  // Step 4: Documents
  const [documents, setDocuments] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  // Step 5: Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false)

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
      setSumInsured(data.sumInsured[0])
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

  const handleGetQuote = async () => {
    try {
      const quoteData = await insuranceAPI.getQuote({
        planId: params.id as string,
        sumInsured,
        policyTerm: policyTerm as any,
        coverageType: coverageType as any,
        members,
        hasExistingPolicy: false,
        hasMedicalHistory: false,
        smoker: false,
        alcoholConsumption: 'NONE',
        selectedAddOns: [],
      })
      setQuote(quoteData)
      setCurrentStep(2)
    } catch (error) {
      console.error('Error getting quote:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        await insuranceAPI.uploadDocument(file, 'ID_PROOF')
      }
      setDocuments([...documents, ...Array.from(files)])
    } catch (error) {
      console.error('Error uploading document:', error)
    } finally {
      setUploading(false)
    }
  }

  const handlePurchase = async () => {
    if (!quote) return

    try {
      const response = await insuranceAPI.purchasePolicy({
        quoteId: quote.id,
        proposer: proposer as any,
        insuredMembers: [],
        nominee: nominee as any,
        medicalDeclaration: medicalDeclaration as any,
        documents: [],
        acceptedTerms,
        acceptedPrivacyPolicy,
      })

      if (response.success) {
        router.push(`/insurance/policy/${response.policyId}`)
      }
    } catch (error) {
      console.error('Error purchasing policy:', error)
    }
  }

  if (loading || !plan) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href={`/insurance/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plan
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Buy {plan.name}</h1>
      </div>

      {/* Progress Steps */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      step.id < currentStep
                        ? 'bg-green-600 text-white'
                        : step.id === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <p className="mt-2 text-xs font-medium text-center">{step.name}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 w-16 mx-2 ${step.id < currentStep ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {/* Step 1: Get Quote */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Get Instant Quote</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Sum Insured</Label>
                  <Select value={sumInsured.toString()} onValueChange={(v) => setSumInsured(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {plan.sumInsured.map((amount) => (
                        <SelectItem key={amount} value={amount.toString()}>
                          {formatCurrency(amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Policy Term</Label>
                  <RadioGroup value={policyTerm} onValueChange={setPolicyTerm}>
                    {plan.policyTerm.map((term) => (
                      <div key={term} className="flex items-center space-x-2">
                        <RadioGroupItem value={term} id={term} />
                        <Label htmlFor={term}>{term.replace(/_/g, ' ')}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label>Coverage Type</Label>
                  <Select value={coverageType} onValueChange={setCoverageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                      <SelectItem value="FAMILY_FLOATER">Family Floater</SelectItem>
                      <SelectItem value="MULTI_INDIVIDUAL">Multi Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Member Details</Label>
                  <div className="space-y-3">
                    {members.map((member, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                              <Label className="text-xs">Relationship</Label>
                              <Input
                                value={member.relationship}
                                onChange={(e) => {
                                  const newMembers = [...members]
                                  newMembers[idx].relationship = e.target.value as any
                                  setMembers(newMembers)
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Date of Birth</Label>
                              <Input
                                type="date"
                                value={member.dateOfBirth}
                                onChange={(e) => {
                                  const newMembers = [...members]
                                  newMembers[idx].dateOfBirth = e.target.value
                                  setMembers(newMembers)
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Gender</Label>
                              <Select
                                value={member.gender}
                                onValueChange={(v) => {
                                  const newMembers = [...members]
                                  newMembers[idx].gender = v as any
                                  setMembers(newMembers)
                                }}
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button onClick={handleGetQuote} className="w-full">
                  Get Quote
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Proposer Details */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Proposer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={proposer.firstName}
                      onChange={(e) => setProposer({ ...proposer, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      value={proposer.lastName}
                      onChange={(e) => setProposer({ ...proposer, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={proposer.email}
                      onChange={(e) => setProposer({ ...proposer, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      value={proposer.phoneNumber}
                      onChange={(e) => setProposer({ ...proposer, phoneNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Date of Birth *</Label>
                    <Input
                      type="date"
                      value={proposer.dateOfBirth}
                      onChange={(e) => setProposer({ ...proposer, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Gender *</Label>
                    <Select
                      value={proposer.gender}
                      onValueChange={(v) => setProposer({ ...proposer, gender: v })}
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

                <Separator />

                <div>
                  <Label>Address Line 1 *</Label>
                  <Input
                    value={proposer.address.line1}
                    onChange={(e) =>
                      setProposer({
                        ...proposer,
                        address: { ...proposer.address, line1: e.target.value },
                      })
                    }
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>City *</Label>
                    <Input
                      value={proposer.address.city}
                      onChange={(e) =>
                        setProposer({
                          ...proposer,
                          address: { ...proposer.address, city: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input
                      value={proposer.address.state}
                      onChange={(e) =>
                        setProposer({
                          ...proposer,
                          address: { ...proposer.address, state: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Pincode *</Label>
                    <Input
                      value={proposer.address.pincode}
                      onChange={(e) =>
                        setProposer({
                          ...proposer,
                          address: { ...proposer.address, pincode: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>PAN Number *</Label>
                    <Input
                      value={proposer.panNumber}
                      onChange={(e) => setProposer({ ...proposer, panNumber: e.target.value.toUpperCase() })}
                      placeholder="ABCDE1234F"
                      required
                    />
                  </div>
                  <div>
                    <Label>Occupation *</Label>
                    <Input
                      value={proposer.occupation}
                      onChange={(e) => setProposer({ ...proposer, occupation: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="flex-1">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Nominee & Medical */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nominee Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>First Name *</Label>
                      <Input
                        value={nominee.firstName}
                        onChange={(e) => setNominee({ ...nominee, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input
                        value={nominee.lastName}
                        onChange={(e) => setNominee({ ...nominee, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Relationship *</Label>
                      <Input
                        value={nominee.relationship}
                        onChange={(e) => setNominee({ ...nominee, relationship: e.target.value })}
                        placeholder="e.g., Spouse, Parent, Child"
                        required
                      />
                    </div>
                    <div>
                      <Label>Phone Number *</Label>
                      <Input
                        value={nominee.phoneNumber}
                        onChange={(e) => setNominee({ ...nominee, phoneNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Medical Declaration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="chronicDisease"
                      checked={medicalDeclaration.hasChronicDisease}
                      onCheckedChange={(checked) =>
                        setMedicalDeclaration({ ...medicalDeclaration, hasChronicDisease: checked as boolean })
                      }
                    />
                    <Label htmlFor="chronicDisease" className="font-normal">
                      Do you have any chronic disease?
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="surgery"
                      checked={medicalDeclaration.hasSurgery}
                      onCheckedChange={(checked) =>
                        setMedicalDeclaration({ ...medicalDeclaration, hasSurgery: checked as boolean })
                      }
                    />
                    <Label htmlFor="surgery" className="font-normal">
                      Have you undergone any surgery in the past?
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medication"
                      checked={medicalDeclaration.takingMedication}
                      onCheckedChange={(checked) =>
                        setMedicalDeclaration({ ...medicalDeclaration, takingMedication: checked as boolean })
                      }
                    />
                    <Label htmlFor="medication" className="font-normal">
                      Are you currently taking any medication?
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(4)} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Upload ID Proof, Address Proof</p>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="mt-4"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{doc.name}</span>
                        <Badge>Uploaded</Badge>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(5)} className="flex-1">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Payment */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="font-normal">
                      I accept the terms and conditions
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={acceptedPrivacyPolicy}
                      onCheckedChange={(checked) => setAcceptedPrivacyPolicy(checked as boolean)}
                    />
                    <Label htmlFor="privacy" className="font-normal">
                      I accept the privacy policy
                    </Label>
                  </div>
                </div>

                <Separator />

                <Button
                  onClick={handlePurchase}
                  disabled={!acceptedTerms || !acceptedPrivacyPolicy}
                  className="w-full"
                  size="lg"
                >
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Quote Summary */}
        {quote && (
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Quote Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-semibold">{plan.name}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Base Premium</span>
                    <span className="font-medium">{formatCurrency(quote.basePremium)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">GST (18%)</span>
                    <span className="font-medium">{formatCurrency(quote.gst)}</span>
                  </div>
                  {quote.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Discount</span>
                      <span className="font-medium">-{formatCurrency(quote.discount)}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total Premium</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(quote.totalPremium)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
