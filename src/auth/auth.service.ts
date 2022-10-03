import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';

@Injectable()
export class AuthService {
  ////////////////////////////////
  logger = new Logger();
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    try {
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    //

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { password: true, email: true, id: true }, // Selecciono los campos a retornar
    });

    if (!user) {
      throw new UnauthorizedException(`Credentials are not valid for ${email}`);
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException(`Credentials are not valid for password`);
    }
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(jwtPayload: JwtPayload) {
    const token = this.jwtService.sign(jwtPayload);
    return token;
  }

  // Verifica que el usuario este autenticado y genera un nuevo token
  checkoutStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  /**
   * Manejo de errores
   * @param error error
   */
  private handleError(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(`Please check server logs`);
  }
}
