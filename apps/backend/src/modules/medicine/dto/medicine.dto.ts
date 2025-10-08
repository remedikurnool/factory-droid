import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max,
  IsDate,
  IsEnum,
  ValidateNested,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// Enums
export enum DosageForm {
  TABLET = 'Tablet',
  CAPSULE = 'Capsule',
  SYRUP = 'Syrup',
  INJECTION = 'Injection',
  OINTMENT = 'Ointment',
  CREAM = 'Cream',
  DROP = 'Drop',
  INHALER = 'Inhaler',
  SUPPOSITORY = 'Suppository',
  PATCH = 'Patch',
}

export enum RouteOfAdministration {
  ORAL = 'Oral',
  TOPICAL = 'Topical',
  INJECTION = 'Injection',
  INHALATION = 'Inhalation',
  RECTAL = 'Rectal',
  TRANSDERMAL = 'Transdermal',
}

export enum PackagingType {
  STRIP = 'strip',
  BOTTLE = 'bottle',
  BOX = 'box',
  BLISTER = 'blister',
  TUBE = 'tube',
  VIAL = 'vial',
}

export enum MedicineSortBy {
  NAME = 'name',
  PRICE_LOW = 'price_low',
  PRICE_HIGH = 'price_high',
  RATING = 'rating',
  POPULARITY = 'popularity',
  NEWEST = 'newest',
  DISCOUNT = 'discount',
}

// Create Medicine DTO
export class CreateMedicineDto {
  @ApiProperty({ description: 'Medicine name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Generic/Scientific name' })
  @IsString()
  @IsNotEmpty()
  genericName: string;

  @ApiProperty({ description: 'Brand UUID' })
  @IsUUID()
  @IsNotEmpty()
  brandId: string;

  @ApiProperty({ description: 'Category UUID' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Medicine description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Medicine composition' })
  @IsString()
  @IsNotEmpty()
  composition: string;

  @ApiProperty({ description: 'Manufacturer name' })
  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @ApiPropertyOptional({ description: 'Manufacturer address' })
  @IsString()
  @IsOptional()
  manufacturerAddress?: string;

  @ApiProperty({ description: 'Requires prescription' })
  @IsBoolean()
  isPrescriptionRequired: boolean;

  @ApiProperty({ description: 'Selling price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Discounted price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPrice?: number;

  @ApiProperty({ description: 'Maximum Retail Price' })
  @IsNumber()
  @Min(0)
  mrp: number;

  @ApiProperty({ description: 'Stock quantity' })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ description: 'Minimum stock level', default: 10 })
  @IsNumber()
  @IsOptional()
  minStockLevel?: number;

  @ApiPropertyOptional({ description: 'Maximum stock level', default: 1000 })
  @IsNumber()
  @IsOptional()
  maxStockLevel?: number;

  @ApiProperty({ description: 'Unit type', example: 'strip' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ description: 'Unit size', example: '10 tablets' })
  @IsString()
  @IsNotEmpty()
  unitSize: string;

  @ApiPropertyOptional({ description: 'Packaging type', enum: PackagingType })
  @IsEnum(PackagingType)
  @IsOptional()
  packagingType?: PackagingType;

  @ApiPropertyOptional({ description: 'Primary image URL' })
  @IsString()
  @IsOptional()
  primaryImage?: string;

  @ApiPropertyOptional({ description: 'Additional image URLs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ description: 'SEO meta title' })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'SEO meta description' })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'SEO keywords', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ description: 'Featured product' })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Best seller' })
  @IsBoolean()
  @IsOptional()
  isBestSeller?: boolean;

  @ApiPropertyOptional({ description: 'New arrival' })
  @IsBoolean()
  @IsOptional()
  isNewArrival?: boolean;

  @ApiPropertyOptional({ description: 'Dosage form', enum: DosageForm })
  @IsEnum(DosageForm)
  @IsOptional()
  dosageForm?: DosageForm;

  @ApiPropertyOptional({ description: 'Strength', example: '500mg' })
  @IsString()
  @IsOptional()
  strength?: string;

  @ApiPropertyOptional({
    description: 'Route of administration',
    enum: RouteOfAdministration,
  })
  @IsEnum(RouteOfAdministration)
  @IsOptional()
  routeOfAdministration?: RouteOfAdministration;

  @ApiPropertyOptional({ description: 'Therapeutic class' })
  @IsString()
  @IsOptional()
  therapeuticClass?: string;

  @ApiPropertyOptional({ description: 'Uses/Indications' })
  @IsString()
  @IsOptional()
  uses?: string;

  @ApiPropertyOptional({ description: 'Side effects' })
  @IsString()
  @IsOptional()
  sideEffects?: string;

  @ApiPropertyOptional({ description: 'Contraindications' })
  @IsString()
  @IsOptional()
  contraindications?: string;

  @ApiPropertyOptional({ description: 'Warnings' })
  @IsString()
  @IsOptional()
  warnings?: string;

  @ApiPropertyOptional({ description: 'Drug interactions' })
  @IsString()
  @IsOptional()
  interactions?: string;

  @ApiPropertyOptional({ description: 'Dosage instructions' })
  @IsString()
  @IsOptional()
  dosageInstructions?: string;

  @ApiPropertyOptional({ description: 'Storage instructions' })
  @IsString()
  @IsOptional()
  storageInstructions?: string;

  @ApiPropertyOptional({ description: 'License number' })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'Manufacturing date' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  manufacturingDate?: Date;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiryDate?: Date;

  @ApiPropertyOptional({ description: 'Batch number' })
  @IsString()
  @IsOptional()
  batchNumber?: string;
}

// Update Medicine DTO
export class UpdateMedicineDto extends PartialType(CreateMedicineDto) {
  @ApiPropertyOptional({ description: 'Active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// Filter/Search DTO
export class FilterMedicinesDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Category UUID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Brand UUID' })
  @IsUUID()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Prescription required filter' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPrescriptionRequired?: boolean;

  @ApiPropertyOptional({ description: 'In stock only' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  inStockOnly?: boolean;

  @ApiPropertyOptional({ description: 'Featured only' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Best sellers only' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isBestSeller?: boolean;

  @ApiPropertyOptional({ description: 'New arrivals only' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isNewArrival?: boolean;

  @ApiPropertyOptional({ description: 'Dosage form', enum: DosageForm })
  @IsEnum(DosageForm)
  @IsOptional()
  dosageForm?: DosageForm;

  @ApiPropertyOptional({ description: 'Therapeutic class' })
  @IsString()
  @IsOptional()
  therapeuticClass?: string;

  @ApiPropertyOptional({ description: 'Minimum rating' })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Sort by', enum: MedicineSortBy })
  @IsEnum(MedicineSortBy)
  @IsOptional()
  sortBy?: MedicineSortBy;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

// Medicine Review DTO
export class CreateMedicineReviewDto {
  @ApiProperty({ description: 'Medicine UUID' })
  @IsUUID()
  @IsNotEmpty()
  medicineId: string;

  @ApiProperty({ description: 'Rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Review title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Review comment' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}

export class UpdateMedicineReviewDto {
  @ApiPropertyOptional({ description: 'Rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ description: 'Review title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Review comment' })
  @IsString()
  @IsOptional()
  comment?: string;
}

// Wishlist DTO
export class AddToWishlistDto {
  @ApiProperty({ description: 'Medicine UUID' })
  @IsUUID()
  @IsNotEmpty()
  medicineId: string;
}

// Stock Management DTO
export enum StockMovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
}

export class UpdateStockDto {
  @ApiProperty({ description: 'Stock movement type', enum: StockMovementType })
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @ApiProperty({ description: 'Quantity (positive for increase, negative for decrease)' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiPropertyOptional({ description: 'Reference (Order ID, Supplier ID, etc.)' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// Price Update DTO
export class UpdatePriceDto {
  @ApiProperty({ description: 'New price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'New MRP' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  mrp?: number;

  @ApiPropertyOptional({ description: 'New discount price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPrice?: number;

  @ApiPropertyOptional({ description: 'Reason for price change' })
  @IsString()
  @IsOptional()
  reason?: string;
}

// Bulk Operations DTO
export class BulkUpdateStockDto {
  @ApiProperty({ description: 'Medicine IDs with quantities', type: 'array' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkStockItem)
  items: BulkStockItem[];
}

export class BulkStockItem {
  @ApiProperty({ description: 'Medicine UUID' })
  @IsUUID()
  medicineId: string;

  @ApiProperty({ description: 'Quantity to add/subtract' })
  @IsNumber()
  quantity: number;
}

// Response DTOs
export class MedicineResponseDto {
  id: string;
  name: string;
  slug: string;
  genericName: string;
  brand: {
    id: string;
    name: string;
    logo?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  description: string;
  composition: string;
  manufacturer: string;
  isPrescriptionRequired: boolean;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  mrp: number;
  stockQuantity: number;
  unit: string;
  unitSize: string;
  packagingType?: string;
  primaryImage?: string;
  images: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  dosageForm?: string;
  strength?: string;
  rating: number;
  reviewCount: number;
  viewCount: number;
  salesCount: number;
  wishlistCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedMedicinesResponseDto {
  data: MedicineResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class MedicineReviewResponseDto {
  id: string;
  medicine: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  helpfulCount: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class StockHistoryResponseDto {
  id: string;
  medicineId: string;
  type: StockMovementType;
  quantity: number;
  reference?: string;
  notes?: string;
  previousStock: number;
  newStock: number;
  createdBy?: string;
  createdAt: Date;
}

export class PriceHistoryResponseDto {
  id: string;
  medicineId: string;
  oldPrice: number;
  newPrice: number;
  oldMrp?: number;
  newMrp?: number;
  reason?: string;
  createdBy?: string;
  createdAt: Date;
}
