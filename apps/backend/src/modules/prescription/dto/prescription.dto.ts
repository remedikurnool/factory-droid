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
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ============================================================================
// ENUMS
// ============================================================================

export enum PrescriptionType {
  E_PRESCRIPTION = 'E_PRESCRIPTION',
  UPLOADED = 'UPLOADED',
}

export enum PrescriptionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// ============================================================================
// MEDICATION DTO
// ============================================================================

export class MedicationDto {
  @ApiProperty({ description: 'Medicine name' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Dosage (e.g., "10mg")' })
  @IsString()
  dosage: string;

  @ApiProperty({ description: 'Frequency (e.g., "Twice daily")' })
  @IsString()
  frequency: string;

  @ApiProperty({ description: 'Duration (e.g., "7 days")' })
  @IsString()
  duration: string;

  @ApiPropertyOptional({ description: 'Instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Timing (e.g., "After meals")' })
  @IsOptional()
  @IsString()
  timing?: string;

  @ApiPropertyOptional({ description: 'Quantity' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;
}

// ============================================================================
// CREATE PRESCRIPTION DTO
// ============================================================================

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Consultation ID' })
  @IsUUID()
  consultationId: string;

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
  @IsString()
  patientGender?: string;

  @ApiProperty({ description: 'Diagnosis' })
  @IsString()
  @MinLength(10)
  diagnosis: string;

  @ApiProperty({ description: 'Medications', type: [MedicationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications: MedicationDto[];

  @ApiPropertyOptional({ description: 'Lab tests recommended' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labTests?: string[];

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiPropertyOptional({ description: 'Follow-up required' })
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @ApiPropertyOptional({ description: 'Follow-up date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ description: 'Validity days', default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  validityDays?: number;
}

// ============================================================================
// UPDATE PRESCRIPTION DTO
// ============================================================================

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
  @ApiPropertyOptional({ description: 'Prescription status', enum: PrescriptionStatus })
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;
}

// ============================================================================
// UPLOAD PRESCRIPTION DTO
// ============================================================================

export class UploadPrescriptionDto {
  @ApiProperty({ description: 'Patient name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  patientName: string;

  @ApiPropertyOptional({ description: 'Patient age' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  patientAge?: number;

  @ApiPropertyOptional({ description: 'Doctor name' })
  @IsOptional()
  @IsString()
  doctorName?: string;

  @ApiPropertyOptional({ description: 'Issue date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================================================
// SEARCH PRESCRIPTIONS DTO
// ============================================================================

export class SearchPrescriptionsDto {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by doctor ID' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ description: 'Filter by consultation ID' })
  @IsOptional()
  @IsUUID()
  consultationId?: string;

  @ApiPropertyOptional({ description: 'Filter by prescription number' })
  @IsOptional()
  @IsString()
  prescriptionNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by type', enum: PrescriptionType })
  @IsOptional()
  @IsEnum(PrescriptionType)
  type?: PrescriptionType;

  @ApiPropertyOptional({ description: 'Filter by status', enum: PrescriptionStatus })
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

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

export class PrescriptionResponseDto {
  id: string;
  prescriptionNumber: string;
  userId: string;
  doctorId?: string;
  consultationId?: string;
  type: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  diagnosis?: string;
  medications: any[];
  labTests: string[];
  specialInstructions?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  issueDate: Date;
  expiryDate: Date;
  status: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  uploadedFileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  doctor?: any;
  user?: any;
  consultation?: any;
}

export class PaginatedPrescriptionsResponseDto {
  @ApiProperty({ type: [PrescriptionResponseDto] })
  prescriptions: PrescriptionResponseDto[];

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
