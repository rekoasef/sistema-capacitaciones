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
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CapacitacionesService } from './capacitaciones.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';
import type { Response } from 'express';

@Controller('capacitaciones')
export class CapacitacionesController {
  constructor(private readonly capacitacionesService: CapacitacionesService) {}

  @Get(':id/exportar/csv')
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createCapacitacionDto: CreateCapacitacionDto) {
    return this.capacitacionesService.create(createCapacitacionDto);
  }

  // --- ¡NUEVO ENDPOINT DE ADMIN! ---
  // Devuelve TODAS las capacitaciones (visibles y ocultas) para el panel de admin.
  // Debe ir antes de /:id para que 'admin' no sea tomado como un id.
  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'))
  findAllForAdmin() {
    return this.capacitacionesService.findAllForAdmin();
  }

  @Get('admin/:id')
  @UseGuards(AuthGuard('jwt'))
  findOneForAdmin(@Param('id') id: string) {
    return this.capacitacionesService.findOneForAdmin(+id);
  }

  // --- PÚBLICO (FILTRADO) ---
  @Get()
  findAll() {
    return this.capacitacionesService.findAll();
  }

  // --- PÚBLICO (FILTRADO) ---
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.capacitacionesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateCapacitacionDto: UpdateCapacitacionDto,
  ) {
    return this.capacitacionesService.update(+id, updateCapacitacionDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.capacitacionesService.remove(+id);
  }

  @Get(':id/inscriptos')
  @UseGuards(AuthGuard('jwt'))
  findInscriptos(@Param('id') id: string) {
    return this.capacitacionesService.findInscriptosByCapacitacion(+id);
  }
}