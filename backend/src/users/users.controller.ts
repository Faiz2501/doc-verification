import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.usersService.getProfile(
      req.user.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(
    @Request() req,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      email?: string;
    },
  ) {
    return this.usersService.updateProfile(
      req.user.sub,
      body,
    );
  }
}