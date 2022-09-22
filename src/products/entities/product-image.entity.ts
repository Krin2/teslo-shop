import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './';

@Entity()
export class ProductImage {
  ////////////////////////////////

  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  @ManyToOne(
    () => Product, //relaciona esta variable con la clase Product
    (product) => product.images, //relaciona a las imagenes de los productos con esta variable
  )
  product: Product;
}
