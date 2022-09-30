import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRolesGuard implements CanActivate {
  // Para obtener los campos de la metadata se usa el Reflector
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Los Guard se encuentran en la zona de excepciones de Nestjs por lo que cualquier excepcion lanzada acá,
    // la va a captar y va alanzar el mensaje correspondiente
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) {
      throw new BadRequestException(`User not found`);
    }

    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }
    throw new ForbiddenException(
      ` User ${user.fullName} needs a valid role (${validRoles})`,
    );
  }
}
