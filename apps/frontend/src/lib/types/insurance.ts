/**
 * Insurance Module Types
 * Types for health insurance plans, quotes, and purchase workflow
 */

// Insurance Plan Types
export type InsurancePlanType =
  | 'HEALTH'
  | 'CRITICAL_ILLNESS'
  | 'PERSONAL_ACCIDENT'
  | 'TOP_UP'
  | 'FAMILY_FLOATER'
  | 'SENIOR_CITIZEN'

export type CoverageType = 
  | 'INDIVIDUAL'
  | 'FAMILY_FLOATER'
  | 'MULTI_INDIVIDUAL'

export type PolicyTerm = '1_YEAR' | '2_YEAR' | '3_YEAR' | 'LIFETIME'

export type ClaimType = 'CASHLESS' | 'REIMBURSEMENT' | 'BOTH'

export type PolicyStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'LAPSED'

// Insurance Plan
export interface InsurancePlan {
  id: string
  name: string
  type: InsurancePlanType
  insuranceCompany: {
    id: string
    name: string
    logo: string
    rating: number
    claimSettlementRatio: number
  }
  coverageType: CoverageType
  description: string
  shortDescription: string
  
  // Coverage Details
  sumInsured: number[]  // Available sum insured options (e.g., [300000, 500000, 1000000])
  basePremium: number  // Base premium amount
  premiumRange: {
    min: number
    max: number
  }
  
  // Policy Terms
  policyTerm: PolicyTerm[]
  claimType: ClaimType[]
  roomRentLimit: string  // e.g., "No limit" or "2% of sum insured"
  
  // Network
  networkHospitals: number
  cashlessHospitals: number
  
  // Key Features
  features: string[]
  
  // Inclusions & Exclusions
  inclusions: string[]
  exclusions: string[]
  
  // Waiting Periods
  waitingPeriod: {
    initial: number  // in days
    preExisting: number  // in months
    specificDiseases: number  // in years
  }
  
  // Additional Details
  coPayment: string  // e.g., "0%" or "20% for seniors"
  daycareProcedures: boolean
  maternityCover: boolean
  maternityWaitingPeriod?: number  // in months
  newbornCover: boolean
  ambulanceCharges: string  // e.g., "₹5,000 per hospitalization"
  preMedicalCheckup: boolean
  
  // Add-ons
  addOns: InsuranceAddOn[]
  
  // Ratings & Reviews
  rating: number
  reviewCount: number
  
  // Claim Process
  claimProcess: {
    steps: string[]
    averageSettlementTime: string  // e.g., "7-14 days"
    documents: string[]
  }
  
  // Metadata
  popular: boolean
  bestValue: boolean
  recommended: boolean
  taxBenefit: boolean
  createdAt: string
  updatedAt: string
}

// Add-ons
export interface InsuranceAddOn {
  id: string
  name: string
  description: string
  premium: number
  available: boolean
}

// Insurance Quote Request
export interface InsuranceQuoteRequest {
  planId: string
  sumInsured: number
  policyTerm: PolicyTerm
  coverageType: CoverageType
  
  // Member Details
  members: QuoteMember[]
  
  // Existing Policy
  hasExistingPolicy: boolean
  existingPolicyDetails?: {
    insurerId: string
    policyNumber: string
    expiryDate: string
    sumInsured: number
  }
  
  // Medical History
  hasMedicalHistory: boolean
  medicalConditions?: string[]
  
  // Lifestyle
  smoker: boolean
  alcoholConsumption: 'NONE' | 'OCCASIONAL' | 'REGULAR'
  
  // Add-ons
  selectedAddOns: string[]
}

export interface QuoteMember {
  relationship: 'SELF' | 'SPOUSE' | 'SON' | 'DAUGHTER' | 'FATHER' | 'MOTHER'
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  occupation?: string
  height?: number  // in cm
  weight?: number  // in kg
}

// Insurance Quote Response
export interface InsuranceQuote {
  id: string
  planId: string
  planName: string
  insuranceCompany: string
  
  // Coverage
  sumInsured: number
  policyTerm: PolicyTerm
  coverageType: CoverageType
  
  // Premium Breakdown
  basePremium: number
  gst: number
  addOnsPremium: number
  discount: number
  totalPremium: number
  
  // Payment Options
  paymentFrequency: 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY'
  
  // Members Covered
  membersCovered: number
  members: QuoteMember[]
  
  // Add-ons Selected
  addOnsSelected: InsuranceAddOn[]
  
  // Validity
  validUntil: string
  
  // Created
  createdAt: string
}

// Purchase Flow
export interface InsurancePurchaseRequest {
  quoteId: string
  
  // Proposer Details
  proposer: ProposerDetails
  
  // Insured Members
  insuredMembers: InsuredMemberDetails[]
  
  // Nominee Details
  nominee: NomineeDetails
  
  // Medical Declaration
  medicalDeclaration: MedicalDeclaration
  
  // Documents
  documents: InsuranceDocument[]
  
  // Terms
  acceptedTerms: boolean
  acceptedPrivacyPolicy: boolean
}

export interface ProposerDetails {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  email: string
  phoneNumber: string
  
  // Address
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    country: string
  }
  
  // ID Proof
  idProofType: 'AADHAAR' | 'PAN' | 'PASSPORT' | 'VOTER_ID' | 'DRIVING_LICENSE'
  idProofNumber: string
  
  // Occupation
  occupation: string
  annualIncome: number
  
  // PAN (mandatory for tax benefits)
  panNumber: string
}

export interface InsuredMemberDetails {
  memberId: string  // From quote members
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  relationship: 'SELF' | 'SPOUSE' | 'SON' | 'DAUGHTER' | 'FATHER' | 'MOTHER'
  
  // Physical Details
  height: number  // in cm
  weight: number  // in kg
  
  // Medical History
  hasMedicalHistory: boolean
  medicalConditions?: MedicalCondition[]
  
  // Lifestyle
  smoker: boolean
  alcoholConsumption: 'NONE' | 'OCCASIONAL' | 'REGULAR'
  
  // Previous Insurance
  hasPreviousInsurance: boolean
  previousInsuranceDetails?: {
    insurerId: string
    policyNumber: string
    sumInsured: number
    claimsMade: boolean
    claimDetails?: string
  }
}

export interface MedicalCondition {
  condition: string
  diagnosedDate: string
  treatment: string
  currentStatus: 'ONGOING' | 'CURED' | 'STABLE'
  medication: string[]
}

export interface NomineeDetails {
  firstName: string
  lastName: string
  dateOfBirth: string
  relationship: string
  phoneNumber: string
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    country: string
  }
  
  // If nominee is minor
  isMinor: boolean
  guardian?: {
    name: string
    relationship: string
    phoneNumber: string
  }
}

export interface MedicalDeclaration {
  hasChronicDisease: boolean
  chronicDiseases?: string[]
  
  hasSurgery: boolean
  surgeryDetails?: {
    type: string
    date: string
    hospital: string
  }[]
  
  hasHospitalization: boolean
  hospitalizationDetails?: {
    reason: string
    date: string
    hospital: string
    duration: number  // in days
  }[]
  
  takingMedication: boolean
  medications?: {
    name: string
    reason: string
    duration: string
  }[]
  
  hasAllergies: boolean
  allergies?: string[]
  
  hasDisability: boolean
  disabilityDetails?: string
  
  familyMedicalHistory: {
    hasDiabetes: boolean
    hasHeartDisease: boolean
    hasCancer: boolean
    hasHypertension: boolean
    other?: string
  }
  
  declarationStatement: string
  declarationDate: string
  declarationPlace: string
}

export interface InsuranceDocument {
  id: string
  type: 'ID_PROOF' | 'ADDRESS_PROOF' | 'INCOME_PROOF' | 'MEDICAL_REPORT' | 'PHOTO' | 'OTHER'
  name: string
  url: string
  size: number
  mimeType: string
  uploadedAt: string
}

// Policy
export interface InsurancePolicy {
  id: string
  policyNumber: string
  planId: string
  planName: string
  insuranceCompany: string
  
  // Coverage
  sumInsured: number
  policyTerm: PolicyTerm
  coverageType: CoverageType
  
  // Dates
  startDate: string
  endDate: string
  issuedDate: string
  
  // Premium
  premium: number
  paymentFrequency: 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'MONTHLY'
  
  // Members
  proposer: ProposerDetails
  insuredMembers: InsuredMemberDetails[]
  nominee: NomineeDetails
  
  // Status
  status: PolicyStatus
  
  // Documents
  policyDocument: string  // URL
  scheduleDocument: string  // URL
  
  // Renewal
  renewalDate: string
  renewalReminder: boolean
  
  // Claims
  claimsMade: number
  totalClaimedAmount: number
  
  // Metadata
  createdAt: string
  updatedAt: string
}

// Comparison
export interface PlanComparison {
  plans: InsurancePlan[]
  compareAttributes: CompareAttribute[]
}

export interface CompareAttribute {
  key: string
  label: string
  values: (string | number | boolean)[]
}

// Search & Filter
export interface InsurancePlanSearchParams {
  type?: InsurancePlanType
  coverageType?: CoverageType
  minSumInsured?: number
  maxSumInsured?: number
  minPremium?: number
  maxPremium?: number
  insuranceCompany?: string
  popular?: boolean
  recommended?: boolean
  taxBenefit?: boolean
  sort?: 'PREMIUM_LOW_HIGH' | 'PREMIUM_HIGH_LOW' | 'RATING_HIGH_LOW' | 'SUM_INSURED_HIGH_LOW'
  page?: number
  limit?: number
}

export interface InsurancePlanSearchResponse {
  plans: InsurancePlan[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Purchase Response
export interface InsurancePurchaseResponse {
  success: boolean
  policyId: string
  policyNumber: string
  paymentId: string
  amount: number
  message: string
}
