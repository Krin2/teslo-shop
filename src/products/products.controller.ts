import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles.interfaces';
import { User } from '../auth/entities/user.entity';
import { Product } from './entities';

@ApiTags('Products') // Agrupa los siguientes endpoints en el documento con la etiqueta "Products"
@Controller('products')
// @Auth() // al ponerlo aca implica que cualquiera que este autenticado puede acceder a las rutas esta clase (sin importar el role)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth() // cualquier usuario autenticado puede crear un producto
  // Los ApiResponse, crean en el documento una tabla con las diferentes respuestas esperadas por el endpoint
  @ApiResponse({
    status: 201, // indica el codigo esperado en la respuesta
    description: 'Product was created', // Es la descripcion que le damos a este codigo de respuesta
    type: Product, // Es el tipo de valor esperado en la respuesta
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  // no hay restriccion de acceso para ver los productos
  findAll(@Query() paginationDto: PaginationDto) {
    console.log(paginationDto);
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  // no hay restriccion de acceso para ver los productos
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin) // solo los admin pueden actualizar los productos
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin) // solo los admin pueden borrar los productos
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
