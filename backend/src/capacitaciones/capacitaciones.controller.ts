// backend/src/capacitaciones/capacitaciones.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CapacitacionesService } from './capacitaciones.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('capacitaciones')
export class CapacitacionesController {
  constructor(
    private readonly capacitacionesService: CapacitacionesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCapacitacionDto: CreateCapacitacionDto) {
    return this.capacitacionesService.create(createCapacitacionDto); 
  }

  // Ruta general de listado (puede ser accedida por cualquier persona para ver el catálogo)
  @Get()
  findAll() {
    return this.capacitacionesService.findAll();
  }

  // FIX: Se añade la ruta admin/all que el frontend está intentando llamar (Ruta protegida)
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  findAllAdmin() {
    return this.capacitacionesService.findAll();
  }

  @Get('publicas')
  findPublic() {
    return this.capacitacionesService.findPublicCapacitaciones();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCapacitacionDto: UpdateCapacitacionDto,
  ) {
    return this.capacitacionesService.update(id, updateCapacitacionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.capacitacionesService.remove(id);
  }
}