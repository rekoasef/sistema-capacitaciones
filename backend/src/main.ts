// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CORRECCIÓN DEFINITIVA DE RUTA: Se añade el prefijo global 'api' ---
  app.setGlobalPrefix('api'); // <-- RE-AÑADIDO PARA FORZAR ESTABILIDAD DE RUTA

  // --- CORRECCIÓN DE CORS ---
  app.enableCors({
    origin: [
      'https://sistema-capacitaciones.vercel.app', 
      'http://localhost:3000',                     
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  // --- CORRECCIÓN DEFINITIVA DE INTERFACES ---
  await app.listen(process.env.PORT || 3000, '0.0.0.0'); 
}
bootstrap();