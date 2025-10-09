import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  IsDateString,
  IsObject,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateNested,
  IsIn,
  IsUUID,
  IsJSON,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ============================================================================
// ENUMS
// ============================================================================

export enum ConsultationType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  CHAT = 'CHAT',
  IN_PERSON = 'IN_PERSON',
}

export enum ConsultationMode {
  FIRST_VISIT = 'FIRST_VISIT',
  FOLLOW_UP = 'FOLLOW_UP',
  EMERGENCY = 'EMERGENCY',
  SECOND_OPINION = 'SECOND_OPINION',
}

export enum ConsultationStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  EXPIRED = 'EXPIRED',
}

// ============================================================================
// BOOK CONSULTATION DTO
// ============================================================================

export class BookConsultationDto {
  @ApiProperty({ description: 'Doctor ID' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ description: 'Time slot ID (optional if date/time provided)' })
  @IsOptional()
  @IsUUID()
  timeSlotId?: string;

  @ApiProperty({ description: 'Scheduled date (YYYY-MM-DD)' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: 'Scheduled time (HH:mm)', example: '10:00' })
  @IsString()
  scheduledTime: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  @Max(180)
  duration?: number;

  @ApiProperty({ description: 'Consultation type', enum: ConsultationType })
  @IsEnum(ConsultationType)
  consultationType: ConsultationType;

  @ApiPropertyOptional({ description: 'Consultation mode', enum: ConsultationMode, default: ConsultationMode.FIRST_VISIT })
  @IsOptional()
  @IsEnum(ConsultationMode)
  consultationMode?: ConsultationMode;

  @ApiProperty({ description: 'Patient name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  patientName: string;

  @ApiPropertyOptional({ description: 'Patient age' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(150)
  patientAge?: number;

  @ApiPropertyOptional({ description: 'Patient gender' })
  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'OTHER'])
  patientGender?: string;

  @ApiPropertyOptional({ description: 'Patient phone' })
  @IsOptional()
  @IsString()
  patientPhone?: string;

  @ApiPropertyOptional({ description: 'Chief complaint' })
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({ description: 'Symptoms', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @ApiPropertyOptional({ description: 'Symptoms description' })
  @IsOptional()
  @IsString()
  symptomsDescription?: string;

  @ApiPropertyOptional({ description: 'Medical history (JSON)' })
  @IsOptional()
  @IsObject()
  medicalHistory?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Allergies', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({ description: 'Current medications (JSON)' })
  @IsOptional()
  @IsObject()
  currentMedications?: Record<string, any>;
}

// ============================================================================
// UPDATE CONSULTATION DTO
// ============================================================================

export class UpdateConsultationDto extends PartialType(BookConsultationDto) {
  @ApiPropertyOptional({ description: 'Consultation status', enum: ConsultationStatus })
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;
}

// ============================================================================
// ADD VITALS DTO
// ============================================================================

export class AddVitalsDto {
  @ApiProperty({ description: 'Blood pressure (e.g., "120/80")' })
  @IsOptional()
  @IsString()
  bloodPressure?: string;

  @ApiPropertyOptional({ description: 'Temperature in Celsius' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Pulse rate (bpm)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pulseRate?: number;

  @ApiPropertyOptional({ description: 'Respiratory rate' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  respiratoryRate?: number;

  @ApiPropertyOptional({ description: 'Oxygen saturation (%)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  oxygenSaturation?: number;

  @ApiPropertyOptional({ description: 'Weight in kg' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ description: 'Height in cm' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ description: 'BMI' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bmi?: number;

  @ApiPropertyOptional({ description: 'Additional vitals (JSON)' })
  @IsOptional()
  @IsObject()
  additional?: Record<string, any>;
}

// ============================================================================
// ADD DIAGNOSIS DTO
// ============================================================================

export class AddDiagnosisDto {
  @ApiProperty({ description: 'Diagnosis' })
  @IsString()
  @MinLength(10)
  diagnosis: string;

  @ApiPropertyOptional({ description: 'Treatment plan' })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @ApiPropertyOptional({ description: 'Follow-up required' })
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @ApiPropertyOptional({ description: 'Follow-up date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ description: 'Follow-up instructions' })
  @IsOptional()
  @IsString()
  followUpInstructions?: string;

  @ApiPropertyOptional({ description: 'Referral notes' })
  @IsOptional()
  @IsString()
  referralNotes?: string;

  @ApiPropertyOptional({ description: 'Doctor notes' })
  @IsOptional()
  @IsString()
  doctorNotes?: string;
}

// ============================================================================
// CANCEL CONSULTATION DTO
// ============================================================================

export class CancelConsultationDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  cancellationReason: string;

  @ApiPropertyOptional({ description: 'Cancelled by (PATIENT/DOCTOR/ADMIN)' })
  @IsOptional()
  @IsIn(['PATIENT', 'DOCTOR', 'ADMIN'])
  cancelledBy?: string;
}

// ============================================================================
// RATE CONSULTATION DTO
// ============================================================================

export class RateConsultationDto {
  @ApiProperty({ description: 'Rating (1-5)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Feedback text' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  feedback?: string;
}

// ============================================================================
// SEARCH CONSULTATIONS DTO
// ============================================================================

export class SearchConsultationsDto {
  @ApiPropertyOptional({ description: 'Filter by doctor ID' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ description: 'Filter by patient/user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ConsultationStatus })
  @IsOptional()
  @IsEnum(ConsultationStatus)
  status?: ConsultationStatus;

  @ApiPropertyOptional({ description: 'Filter by consultation type', enum: ConsultationType })
  @IsOptional()
  @IsEnum(ConsultationType)
  consultationType?: ConsultationType;

  @ApiPropertyOptional({ description: 'Filter by consultation mode', enum: ConsultationMode })
  @IsOptional()
  @IsEnum(ConsultationMode)
  consultationMode?: ConsultationMode;

  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Search by consultation number' })
  @IsOptional()
  @IsString()
  consultationNumber?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ============================================================================
// RESPONSE DTOS
// ============================================================================

export class ConsultationResponseDto {
  id: string;
  consultationNumber: string;
  userId: string;
  doctorId: string;
  scheduledDate: Date;
  scheduledTime: string;
  duration: number;
  consultationType: string;
  consultationMode: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  chiefComplaint?: string;
  symptoms: string[];
  symptomsDescription?: string;
  medicalHistory?: any;
  allergies: string[];
  currentMedications?: any;
  vitals?: any;
  diagnosis?: string;
  treatmentPlan?: string;
  prescriptionId?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpInstructions?: string;
  referralNotes?: string;
  meetingLink?: string;
  consultationFee: number;
  paymentStatus: string;
  status: string;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  patientRating?: number;
  patientFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
  doctor?: any;
  user?: any;
}

export class PaginatedConsultationsResponseDto {
  @ApiProperty({ type: [ConsultationResponseDto] })
  consultations: ConsultationResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasMore: boolean;
}

export class MeetingLinkResponseDto {
  @ApiProperty()
  meetingLink: string;

  @ApiProperty()
  meetingId: string;

  @ApiProperty()
  meetingPassword?: string;

  @ApiProperty()
  consultationId: string;

  @ApiProperty()
  scheduledDate: Date;

  @ApiProperty()
  scheduledTime: string;
}
