import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error, acceptFile: boolean) => void,
) => {
  // Validaciones
  // Valido que el archivo exista
  if (!file) return callback(new Error(`File is empty`), false); // El false devuelto indica que no se acepto el archivo.

  // Valido que el tipo de archivo se ina imagen.
  const fileExtension = file.mimetype.split('/')[1];
  const validExtension = ['jpg', 'png', 'jpeg', 'gif'];
  if (!validExtension.includes(fileExtension)) {
    return callback(new Error('File extension not supported'), false);
  }

  callback(null, true);
};
