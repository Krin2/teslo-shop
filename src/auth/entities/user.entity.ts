import { Product } from '../../products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users') //La entidad es la representacion de la tabla en la db
export class User {
  @PrimaryGeneratedColumn('uuid') // si no se pone nada, usa un number autoincrementado. En este caso estamos cambiando para que use un uuid.
  id: string;

  @ApiProperty({
    example: 'fc8899b7-75e9-4ffb-a45a-71fb63bb66f8',
    description: 'User identification',
    required: true,
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  email: string;

  @ApiProperty({
    example: '$2b$10$oqaXA2H23il6czstGus9fuQ4OUeLB7wSZGjUv22pNWLeOwIPELS96',
    description: 'Encrypted user password',
    required: true,
  })
  @Column('text', {
    select: false, // Deshabilita a este campo cuando se busca en la base de datos
  })
  password: string;

  @ApiProperty({
    example: 'Fabian Lopez',
    description: 'User full name',
    required: true,
  })
  @Column('text', {})
  fullName: string;

  @ApiProperty({
    example: 'true',
    description: 'Account user state',
    required: true,
    default: true,
  })
  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @ApiProperty({
    example: 'user',
    description: 'User roles',
    required: true,
    default: ['user'],
  })
  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }

  @OneToMany(() => Product, (product) => product.user)
  products?: Product[];
}
