import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {
  // Nest tiene incorporado una clase Logger que permite mostrar por consola con formato los errores, warning y ayudas
  private readonly logger = new Logger('ProductsService');

  // Buscar mas informacion sobre el patron repositorio
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = await this.productsRepository.create({
        ...productDetails,
        images: images.map((image) => {
          return this.productImageRepository.create({ url: image });
        }),
      }); // Al crear el producto, si tiene imagenes las agrega a la tabla de imagenes y genera el link entre ambos
      await this.productsRepository.save(product); // guarda el producto en la base de datos (se conecta con la db)
      return { ...product, images };
    } catch (error) {
      this.handleDBExceptios(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 3, offset = 0 } = paginationDto;

    const products = await this.productsRepository.find({
      take: limit,
      skip: offset,
      // Relaciones conotras tablas
      // relacion con la tabla ProductImage
      relations: {
        images: true,
      },
    });

    return products.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productsRepository.findOneBy({ id: term });
    } else {
      // product = await this.productsRepository.findOneBy({ slug: term });
      const queryBuilder = this.productsRepository.createQueryBuilder('prod'); // prod es un alias usado para el querybuilder

      product = await queryBuilder
        // 'select * from Product where title=term or slug=term'
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        // Se agrega porque typeorm eager no funciona cuando se hacen queries)
        .leftJoinAndSelect('prod.images', 'prodImages') // prod.images es la relacion que se va a traer, prodImages es el alias para esta relacion
        .getOne(); // especifica que tome uno solo si es que encuentra mas de uno debido al or
    }

    if (!product)
      throw new NotFoundException(`Product with term ${term} not found`);
    return product;
  }

  // funcion creada para que en imagenes devuelva solamente las urls
  async findOnePlain(term: string) {
    const { images, ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((images) => images.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // El preload busca en la tabla un producto que coincida con el id y le copia encima los datos del updateProductDto
    const { images, ...restToUpdate } = updateProductDto;

    // Hago el preload de los datos que pertenecen a esta tabla
    const product = await this.productsRepository.preload({
      id: id,
      ...restToUpdate,
    });
    // Si el preload no encuentra ningun producto tira una excepcion
    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    // Si el preload encuentra el producto y lo actualiza, tenemos que buscar las images existentes para este producto y reemplazarlas
    // Creacion del QueryRuner
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect(); //se debe esperar a que se conecte a la DB
    await queryRunner.startTransaction(); // Inicia las transacciones

    try {
      if (images) {
        // Si hay imagenes previamente, las borro usando el criterio que ei id del producto coincida
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        // Creo las nuevas imagenes. Estas todabia no estan guardadas en la tabla
        product.images = await images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      // Aca guardo los datos en la base de datos, reemplaza el save de abajo
      await queryRunner.manager.save(product);
      // Si se encontro el producto, se lo guarda ya actualizado por el preload
      // await this.productsRepository.save(product);

      //genera el commit de todas las transacciones realizadas en el medio.
      await queryRunner.commitTransaction();

      // Libera el la conexion del queryRunner
      queryRunner.release();

      // Se hace el find para traer las imagenes que esten actualmente en la tabla
      return this.findOnePlain(id);
    } catch (error) {
      // En caso de que haya un error durante la ejecucion de cualquier transaccion de la query
      // Se hace un rollBack para deshacer cualquier cambio realizado durante las transacciones.
      await queryRunner.rollbackTransaction();

      // Libera el la conexion del queryRunner
      queryRunner.release();

      // Lanza las excepciones
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
