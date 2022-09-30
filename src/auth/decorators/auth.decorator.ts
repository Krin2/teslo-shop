import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRolesGuard } from '../guards/user-roles.guard';
import { ValidRoles } from '../interfaces/valid-roles.interfaces';
import { META_ROLES, RoleProtected } from './role-protected.decorator';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    SetMetadata(META_ROLES, roles),
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRolesGuard),
  );
}
