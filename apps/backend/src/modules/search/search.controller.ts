import { Controller, Get, Post, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import {
  SearchMedicinesDto,
  SearchDoctorsDto,
  SearchLabTestsDto,
  UnifiedSearchDto,
  LocationSearchDto,
  SearchSuggestionsDto,
} from './dto/search.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('medicines')
  @ApiOperation({ summary: 'Search medicines with filters' })
  @HttpCode(HttpStatus.OK)
  async searchMedicines(@Query() dto: SearchMedicinesDto) {
    return this.searchService.searchMedicines(dto);
  }

  @Get('doctors')
  @ApiOperation({ summary: 'Search doctors with filters' })
  @HttpCode(HttpStatus.OK)
  async searchDoctors(@Query() dto: SearchDoctorsDto) {
    return this.searchService.searchDoctors(dto);
  }

  @Get('lab-tests')
  @ApiOperation({ summary: 'Search lab tests with filters' })
  @HttpCode(HttpStatus.OK)
  async searchLabTests(@Query() dto: SearchLabTestsDto) {
    return this.searchService.searchLabTests(dto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Unified search across all entities' })
  @HttpCode(HttpStatus.OK)
  async unifiedSearch(@Query() dto: UnifiedSearchDto) {
    return this.searchService.unifiedSearch(dto);
  }

  @Get('location')
  @ApiOperation({ summary: 'Location-based search' })
  @HttpCode(HttpStatus.OK)
  async locationSearch(@Query() dto: LocationSearchDto) {
    return this.searchService.locationSearch(dto);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions (autocomplete)' })
  @HttpCode(HttpStatus.OK)
  async getSearchSuggestions(@Query() dto: SearchSuggestionsDto) {
    return this.searchService.getSearchSuggestions(dto.query, dto.type);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular searches' })
  @HttpCode(HttpStatus.OK)
  async getPopularSearches(@Query('type') type?: string, @Query('limit') limit?: number) {
    return this.searchService.getPopularSearches(type, limit);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user search history' })
  @HttpCode(HttpStatus.OK)
  async getSearchHistory(@Req() req, @Query('limit') limit?: number) {
    const userId = req.user.id;
    return this.searchService.getSearchHistory(userId, limit);
  }

  @Post('track')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track search query' })
  @AuditLog('SEARCH_TRACKED')
  @HttpCode(HttpStatus.OK)
  async trackSearch(
    @Req() req,
    @Query('query') query: string,
    @Query('type') type: string,
    @Query('results') resultsCount: number
  ) {
    const userId = req.user.id;
    await this.searchService.trackSearch(userId, query, type, resultsCount);
    return { success: true, message: 'Search tracked successfully' };
  }

  @Post('cache/clear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear search cache (admin only)' })
  @AuditLog('SEARCH_CACHE_CLEARED')
  @HttpCode(HttpStatus.OK)
  async clearSearchCache(@Query('type') type?: string) {
    await this.searchService.clearSearchCache(type);
    return { success: true, message: 'Search cache cleared successfully' };
  }
}
