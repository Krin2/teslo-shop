import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigService,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // cualquiera de las 2 formas siguientes es valida para obtener el JWT_SECRET, pero el uso de config permite hacer validaciones antes de usarlo
        // console.log('JWT secret: ', configService.get('JWT_SECRET'));
        // console.log('JWT SECRET: ', process.env.JWT_SECRET);
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
      // JwtModule.register({
      // secret: process.env.JWT_SECRET,
      // signOptions: {
      //   expiresIn: '2h',
      // },
    }),
  ],
  exports: [TypeOrmModule, JwtStrategy, JwtModule, PassportModule],
})
export class AuthModule {}
