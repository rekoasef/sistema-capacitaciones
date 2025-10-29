// src/dashboard/dashboard.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';

// ¡PONEMOS AL GUARDIA! Solo usuarios autenticados podrán acceder a este controlador.
@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Ruta para obtener todas las estadísticas: GET /dashboard
  @Get()
  getStats() {
    return this.dashboardService.getStats();
  }
}