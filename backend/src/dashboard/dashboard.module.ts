// src/dashboard/dashboard.module.ts

import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // Usamos el alias absoluto

@Module({
  imports: [PrismaModule], // <-- Añádelo a los imports
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}