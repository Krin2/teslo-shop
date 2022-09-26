import { v4 as uuid } from 'uuid';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error, filename: string) => void,
) => {
  // Validaciones
  // Esta validacion no deberia ser necesaria, ya que el fileFilter se asegura de que el archivo exista.
  if (!file) return callback(new Error(`File is empty`), null); // El false devuelto indica que no se acepto el archivo.

  const fileExtension = file.mimetype.split('/')[1];

  const filename = `${uuid()}.${fileExtension}`;

  callback(null, filename);
};
