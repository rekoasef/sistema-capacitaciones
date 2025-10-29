// src/grupos/grupos.module.ts

import { Module } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { GruposController } from './grupos.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // <-- Importa el módulo

@Module({
  imports: [PrismaModule], // <-- Añádelo a los imports
  controllers: [GruposController],
  providers: [GruposService],
})
export class GruposModule {}