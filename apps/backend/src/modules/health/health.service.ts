import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as os from 'os';

@Injectable()
export class HealthService {
  private startTime: number;

  constructor(private prisma: PrismaService) {
    this.startTime = Date.now();
  }

  async check() {
    const dbStatus = await this.checkDatabase();

    return {
      status: dbStatus ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      database: dbStatus ? 'connected' : 'disconnected',
    };
  }

  async getMetrics() {
    const uptime = this.getUptime();
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();

    return {
      uptime,
      memory: {
        total: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        used: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`,
        rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
      },
      cpu: {
        user: cpu.user,
        system: cpu.system,
      },
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
      },
    };
  }

  async getDetailedStatus() {
    const dbStatus = await this.checkDatabase();
    const systemInfo = this.getSystemInfo();
    const metrics = await this.getMetrics();

    return {
      status: dbStatus ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus ? 'operational' : 'down',
        api: 'operational',
      },
      system: systemInfo,
      metrics,
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  private getUptime(): string {
    const uptime = Date.now() - this.startTime;
    const seconds = Math.floor((uptime / 1000) % 60);
    const minutes = Math.floor((uptime / (1000 * 60)) % 60);
    const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private getSystemInfo() {
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      loadAverage: os.loadavg(),
    };
  }
}
