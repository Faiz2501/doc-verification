import {
  Controller,
  Get,
} from '@nestjs/common';

import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get()
  getPermissions() {
    return this.permissionsService.getPermissions();
  }

  @Get('roles')
  getRoles() {
    return this.permissionsService.getRoles();
  }

  @Get('assignments')
  getAssignments() {
    return this.permissionsService.getAssignments();
  }
}