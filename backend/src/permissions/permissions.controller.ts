import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { PermissionsService } from './permissions.service';

import { Permission } from '../common/decorators/permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  @UseGuards(PermissionGuard)
  @Permission('MANAGE_STAFF')
  @Get()
  getPermissions() {
    return this.permissionsService.getPermissions();
  }

  @UseGuards(PermissionGuard)
  @Permission('MANAGE_STAFF')
  @Get('roles')
  getRoles() {
    return this.permissionsService.getRoles();
  }

  @UseGuards(PermissionGuard)
  @Permission('MANAGE_STAFF')
  @Get('assignments')
  getAssignments() {
    return this.permissionsService.getAssignments();
  }
}