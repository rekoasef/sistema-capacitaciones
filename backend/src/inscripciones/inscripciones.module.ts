// src/inscripciones/inscripciones.module.ts

import { Module } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { InscripcionesController } from './inscripciones.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // <-- Importa el módulo

@Module({
  imports: [PrismaModule], // <-- Añádelo a los imports
  controllers: [InscripcionesController],
  providers: [InscripcionesService],
})
export class InscripcionesModule {}