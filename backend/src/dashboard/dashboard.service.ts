import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getCustomerDashboard(
    userId: string,
  ) {
    const wallet =
      await this.prisma.wallet.findUnique({
        where: {
          userId,
        },
      });

    const activeApiKey =
      await this.prisma.apiKey.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });

    const totalRequests =
      await this.prisma.verificationRequest.count({
        where: {
          userId,
        },
      });

    const successfulRequests =
      await this.prisma.verificationRequest.count({
        where: {
          userId,
          status: 'SUCCESS',
        },
      });

    const failedRequests =
      await this.prisma.verificationRequest.count({
        where: {
          userId,
          status: 'FAILED',
        },
      });

    const spent =
      await this.prisma.verificationRequest.aggregate({
        where: {
          userId,
        },
        _sum: {
          amount: true,
        },
      });

    const totalTransactions =
      await this.prisma.walletTransaction.count({
        where: {
          userId,
        },
      });

    const recentVerifications =
      await this.prisma.verificationRequest.findMany({
        where: {
          userId,
        },
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          serviceName: true,
          amount: true,
          status: true,
          createdAt: true,
          errorMessage: true,
        },
      });

    return {
      walletBalance:
        wallet?.balance || 0,

      activeApiKey:
        activeApiKey?.apiKey || null,

      totalRequests,

      successfulRequests,

      failedRequests,

      totalSpent:
        spent._sum.amount || 0,

      totalVerifications:
        totalRequests,

      totalTransactions,

      recentVerifications,
    };
  }
}