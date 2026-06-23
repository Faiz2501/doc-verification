import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createTicket(data: {
    userId: string;
    subject: string;
    message: string;
  }) {
    return this.prisma.supportTicket.create({
      data: {
        userId: data.userId,
        subject: data.subject,
        message: data.message,
        status: 'OPEN',
      },
    });
  }

  async getUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAllTickets() {
    return this.prisma.supportTicket.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTicketById(ticketId: string) {
    const ticket =
      await this.prisma.supportTicket.findUnique({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }

    return ticket;
  }

  async updateStatus(
    ticketId: string,
    status: string,
  ) {
    const ticket =
      await this.prisma.supportTicket.findUnique({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }

    return this.prisma.supportTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        status,
      },
    });
  }

  async replyToTicket(
    ticketId: string,
    reply: string,
    status = 'RESOLVED',
  ) {
    const ticket =
      await this.prisma.supportTicket.findUnique({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }

    return this.prisma.supportTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        reply,
        status,
      },
    });
  }

  async deleteTicket(ticketId: string) {
    const ticket =
      await this.prisma.supportTicket.findUnique({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Support ticket not found',
      );
    }

    return this.prisma.supportTicket.delete({
      where: {
        id: ticketId,
      },
    });
  }
}