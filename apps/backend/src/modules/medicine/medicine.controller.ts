import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MedicineService } from './services/medicine.service';
import { MedicineReviewService } from './services/medicine-review.service';
import { WishlistService } from './services/wishlist.service';
import {
  CreateMedicineDto,
  UpdateMedicineDto,
  FilterMedicinesDto,
  CreateMedicineReviewDto,
  UpdateMedicineReviewDto,
  AddToWishlistDto,
  UpdateStockDto,
  UpdatePriceDto,
  BulkUpdateStockDto,
  PaginatedMedicinesResponseDto,
  MedicineResponseDto,
} from './dto/medicine.dto';

@ApiTags('Medicine')
@Controller('medicines')
export class MedicineController {
  constructor(
    private readonly medicineService: MedicineService,
    private readonly reviewService: MedicineReviewService,
    private readonly wishlistService: WishlistService,
  ) {}

  // ==================== Medicine CRUD ====================

  @Post()
  @ApiOperation({ summary: 'Create a new medicine' })
  @ApiResponse({ status: 201, description: 'Medicine created successfully' })
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicineService.create(createMedicineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicines with filters' })
  @ApiResponse({ status: 200, description: 'Medicines retrieved successfully' })
  findAll(
    @Query() filters: FilterMedicinesDto,
  ): Promise<PaginatedMedicinesResponseDto> {
    return this.medicineService.findAll(filters);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured medicines' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getFeatured(@Query('limit') limit?: number): Promise<MedicineResponseDto[]> {
    return this.medicineService.getFeatured(limit ? +limit : 10);
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Get best-selling medicines' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getBestSellers(@Query('limit') limit?: number): Promise<MedicineResponseDto[]> {
    return this.medicineService.getBestSellers(limit ? +limit : 10);
  }

  @Get('new-arrivals')
  @ApiOperation({ summary: 'Get new arrival medicines' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getNewArrivals(@Query('limit') limit?: number): Promise<MedicineResponseDto[]> {
    return this.medicineService.getNewArrivals(limit ? +limit : 10);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock medicines (Admin)' })
  getLowStock(): Promise<MedicineResponseDto[]> {
    return this.medicineService.getLowStock();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get medicine by slug' })
  @ApiResponse({ status: 200, description: 'Medicine retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  findBySlug(@Param('slug') slug: string): Promise<MedicineResponseDto> {
    return this.medicineService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medicine by ID' })
  @ApiResponse({ status: 200, description: 'Medicine retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  findOne(@Param('id') id: string): Promise<MedicineResponseDto> {
    return this.medicineService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medicine' })
  @ApiResponse({ status: 200, description: 'Medicine updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateMedicineDto: UpdateMedicineDto,
  ): Promise<MedicineResponseDto> {
    return this.medicineService.update(id, updateMedicineDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete medicine (soft delete)' })
  @ApiResponse({ status: 204, description: 'Medicine deleted successfully' })
  remove(@Param('id') id: string): Promise<void> {
    return this.medicineService.remove(id);
  }

  // ==================== Stock Management ====================

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update medicine stock' })
  updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.medicineService.updateStock(id, updateStockDto);
  }

  @Post('bulk/stock')
  @ApiOperation({ summary: 'Bulk update medicine stock' })
  bulkUpdateStock(@Body() bulkUpdateDto: BulkUpdateStockDto) {
    return this.medicineService.bulkUpdateStock(bulkUpdateDto);
  }

  // ==================== Price Management ====================

  @Patch(':id/price')
  @ApiOperation({ summary: 'Update medicine price' })
  updatePrice(
    @Param('id') id: string,
    @Body() updatePriceDto: UpdatePriceDto,
  ): Promise<MedicineResponseDto> {
    return this.medicineService.updatePrice(id, updatePriceDto);
  }

  // ==================== Reviews ====================

  @Post('reviews')
  @ApiOperation({ summary: 'Create medicine review' })
  @ApiBearerAuth()
  createReview(
    @Body() createReviewDto: CreateMedicineReviewDto,
    // @CurrentUser() user: any, // Add auth decorator
  ) {
    const userId = 'mock-user-id'; // Replace with actual user ID from auth
    return this.reviewService.create(userId, createReviewDto);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get medicine reviews' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMedicineReviews(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewService.findByMedicine(id, page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':id/reviews/stats')
  @ApiOperation({ summary: 'Get medicine rating statistics' })
  getRatingStats(@Param('id') id: string) {
    return this.reviewService.getRatingStats(id);
  }

  @Patch('reviews/:reviewId')
  @ApiOperation({ summary: 'Update review' })
  @ApiBearerAuth()
  updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateMedicineReviewDto,
    // @CurrentUser() user: any,
  ) {
    const userId = 'mock-user-id'; // Replace with actual user ID
    return this.reviewService.update(reviewId, userId, updateReviewDto);
  }

  @Delete('reviews/:reviewId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete review' })
  @ApiBearerAuth()
  deleteReview(
    @Param('reviewId') reviewId: string,
    // @CurrentUser() user: any,
  ) {
    const userId = 'mock-user-id'; // Replace with actual user ID
    return this.reviewService.remove(reviewId, userId);
  }

  @Post('reviews/:reviewId/approve')
  @ApiOperation({ summary: 'Approve review (Admin)' })
  approveReview(@Param('reviewId') reviewId: string) {
    return this.reviewService.approve(reviewId);
  }

  @Post('reviews/:reviewId/helpful')
  @ApiOperation({ summary: 'Mark review as helpful' })
  markReviewHelpful(@Param('reviewId') reviewId: string) {
    return this.reviewService.markHelpful(reviewId);
  }

  // ==================== Wishlist ====================

  @Get('wishlist/my')
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getWishlist(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    // @CurrentUser() user: any,
  ) {
    const userId = 'mock-user-id'; // Replace with actual user ID
    return this.wishlistService.findAll(userId, page ? +page : 1, limit ? +limit : 20);
  }

  @Get('wishlist/count')
  @ApiOperation({ summary: 'Get wishlist count' })
  @ApiBearerAuth()
  getWishlistCount(
    // @CurrentUser() user: any,
  ) {
    const userId = 'mock-user-id'; // Replace with actual user ID
    return this.wishlistService.getCount(userId);
  }

  @Post('wishlist')
  @ApiOperation({ summary: 'Add medicine to wishlist' })
  @ApiBearerAuth()
  addToWishlist(
    @Body() addToWishlistDto: AddToWishlistDto,
    // @CurrentUser() user: any,
  ) {
    const userId = 'mock-user-id'; // Replace with actual user ID
    return this.wishlistService.add(userId, addToWishlistDto);
  }

  @Delete('wishlist/:medicineId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove medicine from wishlist' })
  @ApiBearerAuth()
  removeFromWishlist(
    @Param('medicineId') medicineId: string,
    // @CurrentUser() user: any,
  ) {
    const userId = 'mock-user-id'; // Replace with actual user ID
    return this.wishlistService.remove(userId, medicineId);
  }

  @Delete('wishlist')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear wishlist' })
  @ApiBearerAuth()
  clearWishlist(
    // @CurrentUser() user: any,
  ) {
    const userId = 'mock-user-id'; // Replace with actual user ID
    return this.wishlistService.clear(userId);
  }

  @Post('wishlist/move-to-cart')
  @ApiOperation({ summary: 'Move wishlist items to cart' })
  @ApiBearerAuth()
  moveWishlistToCart(
    @Body('medicineIds') medicineIds?: string[],
    // @CurrentUser() user: any,
  ) {
    const userId = 'mock-user-id'; // Replace with actual user ID
    return this.wishlistService.moveToCart(userId, medicineIds);
  }

  @Get('wishlist/check/:medicineId')
  @ApiOperation({ summary: 'Check if medicine is in wishlist' })
  @ApiBearerAuth()
  checkWishlist(
    @Param('medicineId') medicineId: string,
    // @CurrentUser() user: any,
  ) {
    const userId = 'mock-user-id'; // Replace with actual user ID
    return this.wishlistService.isInWishlist(userId, medicineId);
  }
}
