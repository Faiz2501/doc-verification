import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
    },
  ) {
    if (data.email) {
      const existingUser =
        await this.prisma.user.findFirst({
          where: {
            email: data.email,
            NOT: {
              id: userId,
            },
          },
        });

      if (existingUser) {
        throw new BadRequestException(
          'Email already exists',
        );
      }
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
  }
}