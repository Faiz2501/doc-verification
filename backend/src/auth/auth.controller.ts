import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('test')
  test() {
    return {
      message: 'AUTH WORKING',
    };
  }

  @Post('register')
  register(
    @Body() dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(
    @Body()
    body: {
      refresh_token: string;
    },
  ) {
    return this.authService.refreshToken(
      body.refresh_token,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @Req() req,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.sub,
      dto,
    );
  }
}