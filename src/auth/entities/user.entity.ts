import { Product } from '../../products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users') //La entidad es la representacion de la tabla en la db
export class User {
  @PrimaryGeneratedColumn('uuid') // si no se pone nada, usa un number autoincrementado. En este caso estamos cambiando para que use un uuid.
  id: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text', {
    select: false, // Deshabilita a este campo cuando se busca en la base de datos
  })
  password: string;

  @Column('text', {})
  fullName: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

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
