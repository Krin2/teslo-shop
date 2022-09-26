import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/products', imageName); // reconstruyo el path de la imagen desde este punto.

    //valido que el path exista
    if (!existsSync(path)) {
      throw new BadRequestException(
        `Not product found with image name ${imageName}`, // si no existe el path, retorno un error
      );
    }
    return path; // Si el path existe retorno el path
  }
}
