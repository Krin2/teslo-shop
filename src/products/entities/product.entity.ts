import { User } from '../../auth/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './';

// La entidad es una representacion de la table dentro de la base de datos.
// Se debe marcar como Entity() y debe ser importado en el module para que sea tenido en cuenta.
// entre las opciones que hay, el name le da el nombre a la tabla en la base de datos
@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // cuando creamos una columna, le podemos especificar el tipo de contenido que tendra.
  // Hay una lista de estos tipos, pero no todos los tipos son aceptados por la base de datos (por ej postgres aca)
  // Luego del tipo de datos, se le puede asignar propiedades de verificacion, como el ser elemento único
  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('float', {
    default: 0,
  }) // prestar atencion que si se elige number como tipo de dato, la db no acepta este tipo usando postgres
  price: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column('text', {
    unique: true,
  })
  slug: string;

  @Column('int', {
    default: 0,
  })
  stock: number;

  @Column('text', {
    array: true,
  })
  sizes: string[];

  @Column('text')
  gender: string;

  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  // Describe la relacion "uno a muchos" entre el producto y las imagenes.
  // El primer termino vincula images en Product con ProductImages.
  // El segundo termino indica la relacion inversa entre ProductImages y Product,
  // de esta forma, a cada producto se le asignara uno o mas Objetos del tipo ProductImage
  // Opcionales: cascade. Se usará para hacer cambios que afecten a ambas tablas
  // Notar que las imagenes son opcionales y vienen en un array de tipo ProductImage.
  // Noter que no se decoro con @Column porque es una referencia a otra tabla y no una columna en si de la entidad
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true, // ver documentacion de typeorm. Hace que el findOne tome las relaciones al usar find*. Para query no sirve
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.products, {
    eager: true, // ver documentacion de typeorm. Hace que el findOne tome las relaciones al usar find*. Para query no sirve
  })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_') // no esta reconociendo estas funcionesdebido a la version de node
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
