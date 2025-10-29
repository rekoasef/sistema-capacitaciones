// backend/src/capacitaciones/capacitaciones.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CapacitacionesService } from './capacitaciones.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import type { Response } from 'express';

// Quitamos el guardia de la puerta principal del controlador
@Controller('capacitaciones')
export class CapacitacionesController {
  constructor(private readonly capacitacionesService: CapacitacionesService) {}

  // Ponemos guardia SOLO en las rutas que necesitan protección

  @Get(':id/exportar/csv')
  @UseGuards(AuthGuard('jwt')) // Protegido
  async exportCapacitacionToCsv(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const csv = await this.capacitacionesService.exportCapacitacionToCsv(+id);
    const filename = `inscriptos_capacitacion_${id}.csv`;
    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    return res.send(csv);
  }

  @Post()
  @UseGuards(AuthGuard('jwt')) // Protegido
  create(@Body() createCapacitacionDto: CreateCapacitacionDto) {
    return this.capacitacionesService.create(createCapacitacionDto);
  }

  // Esta ruta ahora es PÚBLICA (sin @UseGuards)
  @Get()
  findAll() {
    return this.capacitacionesService.findAll();
  }

  // Esta ruta también es PÚBLICA (para la página de detalle pública)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.capacitacionesService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt')) // Protegido
  remove(@Param('id') id: string) {
    return this.capacitacionesService.remove(+id);
  }

  @Get(':id/inscriptos')
  @UseGuards(AuthGuard('jwt')) // Protegido (solo admins ven la lista)
  findInscriptos(@Param('id') id: string) {
    return this.capacitacionesService.findInscriptosByCapacitacion(+id);
  }
}