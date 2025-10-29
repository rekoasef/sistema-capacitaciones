// src/capacitaciones/capacitaciones.module.ts

import { Module } from '@nestjs/common';
import { CapacitacionesService } from './capacitaciones.service';
import { CapacitacionesController } from './capacitaciones.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // <-- Importa el módulo

@Module({
  imports: [PrismaModule], // <-- Añádelo a los imports
  controllers: [CapacitacionesController],
  providers: [CapacitacionesService],
})
export class CapacitacionesModule {}