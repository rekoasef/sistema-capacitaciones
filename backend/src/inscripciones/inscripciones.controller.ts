// src/inscripciones/inscripciones.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Patch, // <-- 1. Importar
  Delete, // <-- 1. Importar
  UseGuards, // <-- 1. Importar
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // <-- 2. Importar
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto'; // <-- 3. Importar
import type { Response } from 'express';

@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  // --- ¡CORRECCIÓN DE SEGURIDAD! ---
  @Get('exportar/csv')
  @UseGuards(AuthGuard('jwt')) // <-- 4. PROTEGER ESTE ENDPOINT
  async exportToCsv(@Res() res: Response) {
    const csv = await this.inscripcionesService.exportToCsv();
    res.header('Content-Type', 'text/csv');
    res.attachment('inscripciones.csv');
    return res.send(csv);
  }

  // --- PÚBLICO ---
  @Post()
  create(@Body() createInscripcionDto: CreateInscripcionDto) {
    return this.inscripcionesService.create(createInscripcionDto);
  }

  // --- PROTEGIDO ---
  @Get()
  @UseGuards(AuthGuard('jwt')) // <-- 5. PROTEGER ESTE ENDPOINT
  findAll() {
    return this.inscripcionesService.findAll();
  }
  
  // --- PROTEGIDO ---
  @Get(':id')
  @UseGuards(AuthGuard('jwt')) // <-- 6. PROTEGER ESTE ENDPOINT
  findOne(@Param('id') id: string) {
    return this.inscripcionesService.findOne(+id);
  }

  // --- ¡NUEVO ENDPOINT PROTEGIDO! ---
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateInscripcionDto: UpdateInscripcionDto,
  ) {
    return this.inscripcionesService.update(+id, updateInscripcionDto);
  }

  // --- ¡NUEVO ENDPOINT PROTEGIDO! ---
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.inscripcionesService.remove(+id);
  }
}