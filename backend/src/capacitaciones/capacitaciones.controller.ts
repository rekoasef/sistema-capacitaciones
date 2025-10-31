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
  Patch, // <-- 1. Importar Patch
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CapacitacionesService } from './capacitaciones.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto'; // <-- 2. Importar DTO
import type { Response } from 'express';

@Controller('capacitaciones')
export class CapacitacionesController {
  constructor(private readonly capacitacionesService: CapacitacionesService) {}

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

  @Get()
  findAll() {
    return this.capacitacionesService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(AuthGuard('jwt'))
  findOneForAdmin(@Param('id') id: string) {
    return this.capacitacionesService.findOneForAdmin(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.capacitacionesService.findOne(+id);
  }

  // --- ¡NUEVO ENDPOINT DE ACTUALIZACIÓN! ---
  @Patch(':id')
  @UseGuards(AuthGuard('jwt')) // Protegido
  update(
    @Param('id') id: string,
    @Body() updateCapacitacionDto: UpdateCapacitacionDto, // <-- 3. Usar el DTO
  ) {
    return this.capacitacionesService.update(+id, updateCapacitacionDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt')) // Protegido
  remove(@Param('id') id: string) {
    return this.capacitacionesService.remove(+id);
  }

  @Get(':id/inscriptos')
  @UseGuards(AuthGuard('jwt')) // Protegido
  findInscriptos(@Param('id') id: string) {
    return this.capacitacionesService.findInscriptosByCapacitacion(+id);
  }
}