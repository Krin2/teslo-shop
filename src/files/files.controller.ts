import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  // El UseInterceptor, intercepta la solicitud y puede modificar el contenido. Se puede usar a nivel controlador y intercepta todas las solicitudes de la clase.
  // El FileInterceptor le dice al interceptor que intercepte la propiedad con el nombre "file" en esta solicitud.
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: { fileSize: 1000 } // Se pueden poner varias opciones como por ejemplo limitar el tamaño del archivo
      storage: diskStorage({
        // El storage indica donde se va a guardar el archivo. En este caso se indica que es en localmente en el disco.
        destination: './static/uploads', // ruta donde se va a guardar el archivo.
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
    return file.originalname;
  }
}
