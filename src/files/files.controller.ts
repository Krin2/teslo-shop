import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('product')
  // El UseInterceptor, intercepta la solicitud y puede modificar el contenido. Se puede usar a nivel controlador y intercepta todas las solicitudes de la clase.
  // El FileInterceptor le dice al interceptor que intercepte la propiedad con el nombre "file" en esta solicitud.
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: { fileSize: 1000 } // Se pueden poner varias opciones como por ejemplo limitar el tamaño del archivo
      storage: diskStorage({
        // El storage indica donde se va a guardar el archivo. En este caso se indica que es en localmente en el disco.
        destination: './static/products', // ruta donde se va a guardar el archivo.
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(
    // El @UploadedFile especifica cual es el archivo que se va a subir
    @UploadedFile() file: Express.Multer.File, // Archivo a subir
  ) {
    if (!file) {
      throw new BadRequestException(`File not provided`);
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/products/${
      file.filename
    }`;

    return secureUrl;
  }

  @Get('product/:imageName')
  findProductImage(
    @Param('imageName') imageName: string,
    @Res() res: Response, // Este decorador indica a nest que la respuesta la vamos a emitir manualmente, con lo cual el return no sirve para devolver la respuesta, se debe usar res.<respuesta>
  ) {
    const path = this.filesService.getStaticProductImage(imageName); // si el path no existe se corta la ejecucion con un error

    res.sendFile(path); // Devuelvo la imagen. (notar que no hay visibilidad de la ruta dentro del ṕroyecto).
  }
}
