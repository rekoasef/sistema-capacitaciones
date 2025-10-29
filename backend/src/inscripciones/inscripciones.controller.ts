// src/inscripciones/inscripciones.controller.ts

import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import type { Response } from 'express';

@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  // --- ¡NUEVO ENDPOINT PARA EXPORTAR! ---
  @Get('exportar/csv')
  async exportToCsv(@Res() res: Response) { // <-- 2. Inyecta el objeto de respuesta
    const csv = await this.inscripcionesService.exportToCsv();

    // 3. Configuramos las cabeceras para la descarga del archivo
    res.header('Content-Type', 'text/csv');
    res.attachment('inscripciones.csv'); // Nombre del archivo que se descargará

    // 4. Enviamos el contenido del CSV como respuesta
    return res.send(csv);
  }

  // ... (El resto de los métodos create, findAll, findOne se mantienen igual) ...
  @Post()
  create(@Body() createInscripcionDto: CreateInscripcionDto) {
    return this.inscripcionesService.create(createInscripcionDto);
  }

  @Get()
  findAll() {
    return this.inscripcionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inscripcionesService.findOne(+id);
  }
}