import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
