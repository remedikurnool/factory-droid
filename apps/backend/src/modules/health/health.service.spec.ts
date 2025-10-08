import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../../database/prisma.service';

describe('HealthService', () => {
  let service: HealthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return healthy status when database is connected', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const result = await service.check();

      expect(result.status).toBe('healthy');
      expect(result.database).toBe('connected');
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeDefined();
    });

    it('should return unhealthy status when database is disconnected', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const result = await service.check();

      expect(result.status).toBe('unhealthy');
      expect(result.database).toBe('disconnected');
    });
  });

  describe('getMetrics', () => {
    it('should return application metrics', async () => {
      const result = await service.getMetrics();

      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('cpu');
      expect(result).toHaveProperty('process');
      expect(result.memory).toHaveProperty('total');
      expect(result.memory).toHaveProperty('used');
      expect(result.process).toHaveProperty('pid');
    });
  });

  describe('getDetailedStatus', () => {
    it('should return detailed system status', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const result = await service.getDetailedStatus();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('services');
      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('metrics');
      expect(result.services).toHaveProperty('database');
      expect(result.services).toHaveProperty('api');
    });
  });
});
