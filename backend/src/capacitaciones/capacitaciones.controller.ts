// backend/src/capacitaciones/capacitaciones.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { CapacitacionesService } from './capacitaciones.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';

@Controller('capacitaciones')
export class CapacitacionesController {
  constructor(private readonly capacitacionesService: CapacitacionesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCapacitacionDto: CreateCapacitacionDto) {
    return this.capacitacionesService.create(createCapacitacionDto);
  }

  // Rutas públicas
  @Get()
  findAll() {
    return this.capacitacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.findOne(id);
  }

  // Rutas de administración (protegidas)
  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAllForAdmin() {
    return this.capacitacionesService.findAllForAdmin();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  findOneForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.findOneForAdmin(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCapacitacionDto: UpdateCapacitacionDto) {
    return this.capacitacionesService.update(id, updateCapacitacionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.remove(id);
  }

  // Exportación global
  @Get(':id/exportar/csv')
  @UseGuards(JwtAuthGuard)
  async exportInscriptos(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      const csvData = await this.capacitacionesService.exportCapacitacionToCsv(id);

      if (csvData.startsWith('No hay inscriptos')) {
        return res.status(200).set({
             'Content-Type': 'text/plain; charset=utf-8',
        }).send(csvData);
      }
      
      res.set({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inscriptos_capacitacion_${id}.csv"`,
      }).send('\ufeff' + csvData);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      res.status(500).send('Error interno al generar el archivo CSV.');
    }
  }
}