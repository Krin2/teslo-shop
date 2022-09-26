import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './';

@Entity({ name: 'product_images' })
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  // Describe la relacion "muchos a uno" entre el ProductImage y Product.
  // El primer termino vincula product en el ProdutImage con Product.
  // El segundo termino indica la relacion inversa entre Product y ProductImage.
  // vincula al product aca con el array de imagenes en Product.
  // Notar que el producto no es opcional, ya que debe estar relacionado a algun producto.
  // Notar que no se decoro como @Column porque es una referencia a otra tabla y no una columna en si de la entidad
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  product: Product;
}
