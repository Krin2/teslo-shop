import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  ////////////////////////////////
  @ApiProperty({
    description: 'Auth e-mail',
    required: true,
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Auth password',
    required: true,
    pattern: '/(?:(?=.*d)|(?=.*W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @ApiProperty({
    description: 'Auth full name',
    required: true,
  })
  @IsString()
  @MinLength(1)
  fullName: string;

  @ApiProperty({
    description: 'Auth roles',
    required: true,
    isArray: true,
    enum: ['admin', 'user', 'super-user'],
  })
  @IsArray()
  roles: string[];
}
