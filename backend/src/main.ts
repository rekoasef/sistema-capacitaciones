// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CORRECCIÓN DE CORS ---
  // Especificamos exactamente qué dominios pueden pedir datos
  app.enableCors({
    origin: [
      'https://sistema-capacitaciones.vercel.app', // Tu dominio de Producción (Vercel)
      'http://localhost:3000',                     // Tu entorno Local (para que sigas pudiendo desarrollar)
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  // Render asigna un puerto dinámico en la variable PORT, o usa 3000 por defecto
  await app.listen(process.env.PORT || 3000);
}
bootstrap();