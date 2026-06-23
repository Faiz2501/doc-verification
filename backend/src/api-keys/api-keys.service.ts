import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async generateApiKey(
    userId: string,
    name: string,
  ) {
    await this.prisma.apiKey.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const apiKey =
      'sk_' +
      randomUUID().replace(/-/g, '');

    return this.prisma.apiKey.create({
      data: {
        userId,
        name,
        apiKey,
        isActive: true,
      },
    });
  }

  async regenerateApiKey(
    userId: string,
    name: string,
  ) {
    await this.prisma.apiKey.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const apiKey =
      'sk_' +
      randomUUID().replace(/-/g, '');

    return this.prisma.apiKey.create({
      data: {
        userId,
        name,
        apiKey,
        isActive: true,
      },
    });
  }

  async deactivateApiKey(id: string) {
    return this.prisma.apiKey.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }

  async getUserKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUsageLogs(userId: string) {
    return this.prisma.verificationRequest.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        serviceName: true,
        amount: true,
        status: true,
        createdAt: true,
        errorMessage: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUsageAnalytics(userId: string) {
    const requests =
      await this.prisma.verificationRequest.findMany({
        where: {
          userId,
        },
      });

    const totalRequests =
      requests.length;

    const successfulRequests =
      requests.filter(
        (r) => r.status === 'SUCCESS',
      ).length;

    const failedRequests =
      requests.filter(
        (r) => r.status === 'FAILED',
      ).length;

    const totalSpent =
      requests.reduce(
        (sum, r) => sum + r.amount,
        0,
      );

    const servicesUsed: Record<
      string,
      number
    > = {};

    requests.forEach((r) => {
      servicesUsed[r.serviceName] =
        (servicesUsed[r.serviceName] || 0) + 1;
    });

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      totalSpent,
      successRate:
        totalRequests === 0
          ? '0%'
          : (
              (successfulRequests /
                totalRequests) *
              100
            ).toFixed(2) + '%',
      servicesUsed,
    };
  }

  async validateApiKey(apiKey: string) {
    return this.prisma.apiKey.findFirst({
      where: {
        apiKey,
        isActive: true,
      },
    });
  }
}