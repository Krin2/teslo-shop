// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// El PartialType importado de mapped-type no me ayuda a generar la documentacion, por lo que se importa de swagger.
// no hace falta ningun decorador para que tome los cambios el documento.
// en el documento se puede ver que los campos son los mismos que en el create, pero sin el asterisco de requerido
export class UpdateProductDto extends PartialType(CreateProductDto) {}
