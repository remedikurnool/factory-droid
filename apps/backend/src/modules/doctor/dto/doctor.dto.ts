import {
  IsString,
  IsEmail,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  IsUrl,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsDateString,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ============================================================================
// ENUMS
// ============================================================================

export enum AvailabilityMode {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BOTH = 'BOTH',
}

export enum DoctorSortOption {
  RATING_HIGH = 'RATING_HIGH',
  RATING_LOW = 'RATING_LOW',
  EXPERIENCE_HIGH = 'EXPERIENCE_HIGH',
  EXPERIENCE_LOW = 'EXPERIENCE_LOW',
  FEE_LOW = 'FEE_LOW',
  FEE_HIGH = 'FEE_HIGH',
  NAME_ASC = 'NAME_ASC',
  NAME_DESC = 'NAME_DESC',
}

// ============================================================================
// CREATE DOCTOR DTO
// ============================================================================

export class CreateDoctorDto {
  @ApiProperty({ description: 'First name of the doctor' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ description: 'Last name of the doctor' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone: string;

  @ApiProperty({ description: 'Medical specialty' })
  @IsString()
  specialty: string;

  @ApiPropertyOptional({ description: 'Sub-specialty if any' })
  @IsOptional()
  @IsString()
  subSpecialty?: string;

  @ApiProperty({ description: 'Medical qualifications (degrees, certifications)' })
  @IsString()
  qualifications: string;

  @ApiProperty({ description: 'Medical registration/license number' })
  @IsString()
  registrationNo: string;

  @ApiProperty({ description: 'Years of experience' })
  @IsNumber()
  @Min(0)
  @Max(70)
  experienceYears: number;

  @ApiProperty({ description: 'Consultation fee (INR)' })
  @IsNumber()
  @Min(0)
  consultationFee: number;

  @ApiPropertyOptional({ description: 'Follow-up consultation fee (INR)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  followUpFee?: number;

  @ApiPropertyOptional({ description: 'Professional bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @ApiProperty({ description: 'Languages spoken', type: [String] })
  @IsArray()
  @IsString({ each: true })
  languages: string[];

  // Location details
  @ApiPropertyOptional({ description: 'Clinic name' })
  @IsOptional()
  @IsString()
  clinicName?: string;

  @ApiPropertyOptional({ description: 'Clinic address' })
  @IsOptional()
  @IsString()
  clinicAddress?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Pincode' })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Availability mode',
    enum: AvailabilityMode,
    default: AvailabilityMode.BOTH,
  })
  @IsOptional()
  @IsEnum(AvailabilityMode)
  availabilityMode?: AvailabilityMode;

  @ApiPropertyOptional({ description: 'Is doctor available', default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Is doctor active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================================================
// UPDATE DOCTOR DTO
// ============================================================================

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  @ApiPropertyOptional({ description: 'Is doctor verified' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'SEO slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Search keywords' })
  @IsOptional()
  @IsString()
  searchKeywords?: string;
}

// ============================================================================
// SEARCH DOCTORS DTO
// ============================================================================

export class SearchDoctorsDto {
  @ApiPropertyOptional({ description: 'Search query (name, specialty, keywords)' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  query?: string;

  @ApiPropertyOptional({ description: 'Filter by specialty' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ description: 'Filter by sub-specialty' })
  @IsOptional()
  @IsString()
  subSpecialty?: string;

  @ApiPropertyOptional({ description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by availability mode', enum: AvailabilityMode })
  @IsOptional()
  @IsEnum(AvailabilityMode)
  availabilityMode?: AvailabilityMode;

  @ApiPropertyOptional({ description: 'Minimum experience years' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minExperience?: number;

  @ApiPropertyOptional({ description: 'Maximum experience years' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(70)
  maxExperience?: number;

  @ApiPropertyOptional({ description: 'Minimum consultation fee' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minFee?: number;

  @ApiPropertyOptional({ description: 'Maximum consultation fee' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxFee?: number;

  @ApiPropertyOptional({ description: 'Minimum rating (1-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Filter by language', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ description: 'Filter by verified doctors only' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verifiedOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter by available doctors only' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  availableOnly?: boolean;

  @ApiPropertyOptional({ description: 'Sort option', enum: DoctorSortOption, default: DoctorSortOption.RATING_HIGH })
  @IsOptional()
  @IsEnum(DoctorSortOption)
  sort?: DoctorSortOption;

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
// LOCATION SEARCH DTO
// ============================================================================

export class NearbyDoctorsDto {
  @ApiProperty({ description: 'User latitude' })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'User longitude' })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ description: 'Search radius in kilometers', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  radius?: number;

  @ApiPropertyOptional({ description: 'Filter by specialty' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ============================================================================
// DOCTOR AVAILABILITY DTO
// ============================================================================

export class GetAvailabilityDto {
  @ApiProperty({ description: 'Doctor ID' })
  @IsString()
  doctorId: string;

  @ApiProperty({ description: 'Date to check availability (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Consultation type', enum: ['VIDEO', 'AUDIO', 'CHAT', 'IN_PERSON'] })
  @IsOptional()
  @IsIn(['VIDEO', 'AUDIO', 'CHAT', 'IN_PERSON'])
  consultationType?: string;
}

export class CreateTimeSlotDto {
  @ApiProperty({ description: 'Doctor ID' })
  @IsString()
  doctorId: string;

  @ApiProperty({ description: 'Date (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Start time (HH:mm format)', example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time (HH:mm format)', example: '09:30' })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ description: 'Slot duration in minutes', default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  @Max(180)
  duration?: number;

  @ApiPropertyOptional({ description: 'Slot type', enum: ['REGULAR', 'EMERGENCY', 'FOLLOW_UP', 'BLOCKED'], default: 'REGULAR' })
  @IsOptional()
  @IsIn(['REGULAR', 'EMERGENCY', 'FOLLOW_UP', 'BLOCKED'])
  slotType?: string;

  @ApiPropertyOptional({ description: 'Allowed consultation types', type: [String] })
  @IsOptional()
  @IsArray()
  @IsIn(['VIDEO', 'AUDIO', 'CHAT', 'IN_PERSON'], { each: true })
  allowedTypes?: string[];

  @ApiPropertyOptional({ description: 'Custom fee for this slot' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fee?: number;

  @ApiPropertyOptional({ description: 'Slot notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkCreateTimeSlotsDto {
  @ApiProperty({ description: 'Doctor ID' })
  @IsString()
  doctorId: string;

  @ApiProperty({ description: 'Start date (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date (YYYY-MM-DD)' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Working days', type: [Number], example: [1, 2, 3, 4, 5] })
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  workingDays: number[]; // 0=Sunday, 6=Saturday

  @ApiProperty({ description: 'Slot start time', example: '09:00' })
  @IsString()
  slotStartTime: string;

  @ApiProperty({ description: 'Slot end time', example: '17:00' })
  @IsString()
  slotEndTime: string;

  @ApiProperty({ description: 'Slot duration in minutes' })
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  @Max(180)
  slotDuration: number;

  @ApiPropertyOptional({ description: 'Break times', type: [Object], example: [{ start: '13:00', end: '14:00' }] })
  @IsOptional()
  @IsArray()
  breakTimes?: Array<{ start: string; end: string }>;
}

// ============================================================================
// RESPONSE DTOS
// ============================================================================

export class DoctorResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  subSpecialty?: string;
  qualifications: string;
  registrationNo: string;
  experienceYears: number;
  consultationFee: number;
  followUpFee?: number;
  bio?: string;
  profileImage?: string;
  languages: string[];
  clinicName?: string;
  clinicAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  isAvailable: boolean;
  isActive: boolean;
  isVerified: boolean;
  availabilityMode: string;
  rating: number;
  reviewCount: number;
  totalConsultations: number;
  completedConsultations: number;
  slug?: string;
  nextAvailableSlot?: Date;
  createdAt: Date;
  updatedAt: Date;
  distance?: number; // For location-based search
}

export class PaginatedDoctorsResponseDto {
  @ApiProperty({ type: [DoctorResponseDto] })
  doctors: DoctorResponseDto[];

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

export class TimeSlotResponseDto {
  id: string;
  doctorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  slotType: string;
  isAvailable: boolean;
  isBooked: boolean;
  allowedTypes: string[];
  fee?: number;
  notes?: string;
}

export class AvailabilityResponseDto {
  @ApiProperty()
  date: string;

  @ApiProperty({ type: [TimeSlotResponseDto] })
  slots: TimeSlotResponseDto[];

  @ApiProperty()
  totalSlots: number;

  @ApiProperty()
  availableSlots: number;

  @ApiProperty()
  bookedSlots: number;
}
