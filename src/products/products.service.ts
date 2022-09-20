import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  // Nest tiene incorporado una clase Logger que permite mostrar por consola con formato los errores, warning y ayudas
  private readonly logger = new Logger('ProductsService');

  // Buscar mas informacion sobre el patron repositorio
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productsRepository.create(createProductDto); // Crea el producto con la "forma" de createProductDto (no hay coneccion con la db)
      await this.productsRepository.save(product); // guarda el producto en la base de datos (se conecta con la db)
      return product;
    } catch (error) {
      this.handleDBExceptios(error);
    }
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private handleDBExceptios(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    // el error se ve en consola de color rojo como:
    // [Nest] 51297  - 09/20/2022, 4:44:56 PM   ERROR [ProductsService] QueryFailedError: duplicate key value violates unique constraint "UQ_f7bf944ad9f1034110e8c2133ab"
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!');
  }
}
