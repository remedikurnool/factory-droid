import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    return this.healthService.check();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get application metrics' })
  @ApiResponse({ status: 200, description: 'Returns application metrics' })
  async metrics() {
    return this.healthService.getMetrics();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get detailed status' })
  @ApiResponse({ status: 200, description: 'Returns detailed system status' })
  async status() {
    return this.healthService.getDetailedStatus();
  }
}
