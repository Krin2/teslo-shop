import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interfaces';

// lo declaramos como injectable porque es un provider para este proyecto
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  //

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly configService: ConfigService,
  ) {
    // al extender de otra clase, debe pasarle los datos del contructor
    super({
      secretOrKey: configService.get('JWT_SECRET'), // secret extraida del .env
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // esta configuracion indica de donde va a tomar el jwt-token en la peticion.
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    //
    const { id } = payload;

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new UnauthorizedException(`Token not valid`);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(`User is inactive, talk to an admin`);
    }

    // Al retornar el user, este es agregado al Request y puede ser accedido por el resto de las consultas
    return user;
  }
}
