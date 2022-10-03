import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  // data trae los argumentos con los que es llamado GetUser
  // ctx trae el contexto en el cual se esta ejecutando este decorador. Aca se encuentra el Request

  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  if (!user) {
    throw new InternalServerErrorException(`User not found in request`);
  }
  return !data ? user : user.email;
});
