import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();

    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);

    return 'seed executed';
  }

  private async deleteTables() {
    // Primero borro todos los productos
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  // Inserta usuarios desde la semilla
  private async insertUsers() {
    const seedUsers = initialData.users.map((user) => {
      const { password, ...others } = user;
      const encriptedPassword = bcrypt.hashSync(password, 10);
      return { ...others, password: encriptedPassword };
    });

    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    // Creo esta constante porque es necesario que se termine de crear los usuarios para poder asociarlos a la tabla de productos
    // Si retornace el users[0], al usuario le faltaria el id que se genera en la db.
    const dbUsers = await this.userRepository.save(seedUsers);

    // retorno el primer usuario para poder usarlo con los productos
    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productsService.create(product, user));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
