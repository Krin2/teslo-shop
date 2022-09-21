import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  // Nest tiene incorporado una clase Logger que permite mostrar por consola con formato los errores, warning y ayudas
  private readonly logger = new Logger('ProductsService');

  // Buscar mas informacion sobre el patron repositorio
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productsRepository.create(createProductDto); // Crea el producto con la "forma" de createProductDto (no hay coneccion con la db)
      await this.productsRepository.save(product); // guarda el producto en la base de datos (se conecta con la db)
      return product;
    } catch (error) {
      this.handleDBExceptios(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 3, offset = 0 } = paginationDto;
    return await this.productsRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productsRepository.findOneBy({ id: term });
    } else {
      // product = await this.productsRepository.findOneBy({ slug: term });
      const queryBuilder = this.productsRepository.createQueryBuilder();

      product = await queryBuilder
        // 'select * from Product where title=term or slug=term'
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .getOne(); // especifica que tome uno solo si es que encuentra mas de uno debido al or
    }

    if (!product)
      throw new NotFoundException(`Product with term ${term} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // El preload busca en la tabla un producto que coincida con el id y le copia encima los datos del updateProductDto
    const product = await this.productsRepository.preload({
      id: id,
      ...updateProductDto,
    });
    // El preload puede no encontrar ningun producto
    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    try {
      // Si se encontro el producto, se lo guarda ya actualizado por el preload
      await this.productsRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptios(error);
    }
  }

  async remove(id: string) {
    const product = await this.productsRepository.delete(id);
    if (!product.affected)
      throw new NotFoundException(`Product with id ${id} not found`);
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
