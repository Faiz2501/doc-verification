import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
  Param,
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

  // ADMIN - GET ALL USERS
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  // ADMIN - GET USER BY ID
  @Get(':id')
  getUserById(
    @Param('id') id: string,
  ) {
    return this.usersService.getUserById(id);
  }

  // ADMIN - UPDATE USER ROLE
  @Patch(':id/role')
  updateUserRole(
    @Param('id') id: string,

    @Body()
    body: {
      role: string;
    },
  ) {
    return this.usersService.updateUserRole(
      id,
      body.role,
    );
  }
}