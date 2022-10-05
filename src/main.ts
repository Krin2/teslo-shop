import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Open-API
  // Configuracion del documento
  const config = new DocumentBuilder()
    .setTitle('Teslo RESTFul API') // Titulo del documento
    .setDescription('Teslo shop endpoints') // Descripcion del proyecto
    .setVersion('1.0') // Version del documento
    .build();

  // Creacion del documento usando esta app y la configuracion anterior
  const document = SwaggerModule.createDocument(app, config);

  // En el endpoint "api", se manda la aplicacion y la documentacion
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
  logger.log(`App running on port. ${process.env.PORT}`);
}
bootstrap();
