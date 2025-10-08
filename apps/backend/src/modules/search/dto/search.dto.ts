import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum MedicineSortBy {
  RELEVANCE = 'relevance',
  PRICE = 'price',
  NAME = 'name',
  POPULARITY = 'popularity',
  RATING = 'rating',
  NEWEST = 'newest',
}

export enum DoctorSortBy {
  RELEVANCE = 'relevance',
  FEE = 'fee',
  EXPERIENCE = 'experience',
  RATING = 'rating',
  NAME = 'name',
}

export enum LabTestSortBy {
  RELEVANCE = 'relevance',
  PRICE = 'price',
  NAME = 'name',
  POPULARITY = 'popularity',
}

// Search DTOs
export class SearchMedicinesDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Medicine category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Manufacturer name' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by prescription requirement' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  prescriptionRequired?: boolean;

  @ApiPropertyOptional({ description: 'Filter by stock availability' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: MedicineSortBy,
    default: MedicineSortBy.RELEVANCE,
  })
  @IsOptional()
  @IsEnum(MedicineSortBy)
  sortBy?: MedicineSortBy = MedicineSortBy.RELEVANCE;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class SearchDoctorsDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Doctor specialty' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ description: 'Minimum years of experience' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  experience?: number;

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
  @Min(0)
  maxFee?: number;

  @ApiPropertyOptional({ description: 'Filter by availability' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  availability?: boolean;

  @ApiPropertyOptional({ description: 'Doctor gender' })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other'])
  gender?: string;

  @ApiPropertyOptional({ description: 'Languages spoken' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ description: 'Minimum rating (1-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: DoctorSortBy,
    default: DoctorSortBy.RELEVANCE,
  })
  @IsOptional()
  @IsEnum(DoctorSortBy)
  sortBy?: DoctorSortBy = DoctorSortBy.RELEVANCE;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class SearchLabTestsDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Lab test category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by home collection availability' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  homeCollection?: boolean;

  @ApiPropertyOptional({ description: 'Maximum report delivery time (hours)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  reportTime?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: LabTestSortBy,
    default: LabTestSortBy.RELEVANCE,
  })
  @IsOptional()
  @IsEnum(LabTestSortBy)
  sortBy?: LabTestSortBy = LabTestSortBy.RELEVANCE;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class UnifiedSearchDto {
  @ApiProperty({ description: 'Search query' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class LocationSearchDto {
  @ApiProperty({ description: 'Latitude coordinate' })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({
    description: 'Search radius in kilometers',
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  radius?: number = 5;

  @ApiPropertyOptional({
    description: 'Type of location to search',
    enum: ['doctors', 'labs', 'pharmacies'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['doctors', 'labs', 'pharmacies'])
  type?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class SearchSuggestionsDto {
  @ApiProperty({ description: 'Query for suggestions' })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Type of suggestions',
    enum: ['medicines', 'doctors', 'labtests', 'all'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['medicines', 'doctors', 'labtests', 'all'])
  type?: string;
}

// Response DTOs
export class SearchResultsDto {
  @ApiProperty({ description: 'Search result items' })
  items: any[];

  @ApiProperty({ description: 'Total count of results' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has more results' })
  hasMore: boolean;
}
