import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http2';
import { AuthService } from './auth.service';
import { GetHeader, GetUser, RoleProtected } from './decorators';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRolesGuard } from './guards/user-roles.guard';
import { ValidRoles } from './interfaces/valid-roles.interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard()) //esta linea especifica el uso de un guard para validar el ingreso a esta ruta
  testingPrivateRoutes(
    @GetUser() user: User, // decorador personalizado para validar y traer al usuario
    @GetUser('email') userEmail: string, // la data podria venir con muchos campos y se usaria un string[] en vez de un string
    @GetHeader() rawHeaders: string[], // decorador personalizado para traer el rawHeaders
    @Headers() headers: IncomingHttpHeaders, // Existen decoradores para traer los campos del request
  ) {
    return {
      ok: true,
      message: `Entering in a private route`,
      user,
      userEmail,
      rawHeaders,
      headers,
    };
  }

  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.superUser, ValidRoles.user, ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRolesGuard) //El UserRolesGuard no usa parentesis porque no queremos generar una ueva instancia sino que queremos usar la ya existente creada por el AuthGuard
  testingPrivateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      message: `Entering in a private route`,
      user,
    };
  }
}
