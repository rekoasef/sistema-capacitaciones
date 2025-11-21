// backend/src/inscripciones/inscripciones.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Res } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';

@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  // Rutas de administración (protegidas)
  @Get('exportar/csv')
  @UseGuards(JwtAuthGuard)
  async exportInscriptos(@Res() res: Response) {
    const csv = await this.inscripcionesService.exportToCsv(); // FIX
    
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="inscripciones_totales.csv"',
    }).send('\ufeff' + csv);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.inscripcionesService.findAll(); // FIX
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionesService.findOne(id); // FIX
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateInscripcionDto: UpdateInscripcionDto) {
    return this.inscripcionesService.update(id, updateInscripcionDto); // FIX
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionesService.remove(id); // FIX
  }

  // Ruta pública (sin guardia)
  @Post()
  create(@Body() createInscripcionDto: CreateInscripcionDto) {
    return this.inscripcionesService.create(createInscripcionDto);
  }
}