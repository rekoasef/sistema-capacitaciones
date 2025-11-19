// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // <-- AÑADIDO PARA LEER CONFIGURACIÓN

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- DEBUG: LOGGING JWT_SECRET PARA CONFIRMAR CARGA ---
  // Obtenemos el servicio de configuración para leer la variable de entorno
  const configService = app.get(ConfigService);
  const jwtSecret = configService.get<string>('JWT_SECRET');
  
  // Imprimimos el valor para saber si está cargado (busca estos logs)
  console.log(`[DEBUG] JWT_SECRET cargado: ${jwtSecret ? 'SÍ' : 'NO'}`);
  if (jwtSecret) {
      // Muestra un fragmento para confirmar que el valor es correcto (sin comillas)
      console.log(`[DEBUG] Longitud: ${jwtSecret.length}, Inicio: ${jwtSecret.substring(0, 15)}...`); 
  }
  // --- FIN DEBUG ---

  // --- CORRECCIÓN DEFINITIVA DE RUTA: Se añade el prefijo global 'api' ---
  app.setGlobalPrefix('api');

  // --- CORRECCIÓN DE CORS ---
  app.enableCors({
    origin: [
      'https://sistema-capacitaciones.vercel.app', 
      'http://localhost:3000',                     
      'http://localhost:3002', // Puerto del frontend de desarrollo
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  // FIX: Escuchamos en el puerto 3001 (el que expone Docker Compose)
  await app.listen(process.env.PORT || 3001, '0.0.0.0'); 
}
bootstrap();