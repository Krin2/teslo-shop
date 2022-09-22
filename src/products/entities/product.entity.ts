import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './';

// La entidad es una representacion de la table dentro de la base de datos.
// Se debe marcar como Entity() y debe ser importado en el module para que sea tenido en cuenta.
@Entity()
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

  @OneToMany(
    () => ProductImage, // describe la relacion directa entre esta variable con la tabla ProductImage
    (productImage: ProductImage) => productImage.product, // Describe la relacion inversa entre la variable producto y la images
    { cascade: true }, // la opcion cascade hace referencia a que si se elimina un producto, se eliminan las referencias en la otra tabla
  )
  images?: ProductImage;

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
