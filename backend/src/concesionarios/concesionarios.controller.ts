// backend/src/concesionarios/concesionarios.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ConcesionariosService } from './concesionarios.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateConcesionarioDto } from './dto/create-concesionario.dto';
import { UpdateConcesionarioDto } from './dto/update-concesionario.dto';

@Controller('concesionarios')
export class ConcesionariosController {
  constructor(private readonly concesionariosService: ConcesionariosService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createConcesionarioDto: CreateConcesionarioDto) {
    return this.concesionariosService.create(createConcesionarioDto);
  }

  @Get()
  findAll() {
    return this.concesionariosService.findAll();
  }

  // --- ¡NUEVO ENDPOINT DE REPORTE (PROTEGIDO)! ---
  // Esta ruta debe ir ANTES de '/:id' para que 'reporte' no sea
  // interpretado como un ID.
  @Get('reporte/:id')
  @UseGuards(AuthGuard('jwt'))
  getReporte(@Param('id') id: string) {
    return this.concesionariosService.getReporte(+id);
  }

  // --- PÚBLICO (para formulario de inscripción) ---
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.concesionariosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateConcesionarioDto: UpdateConcesionarioDto,
  ) {
    return this.concesionariosService.update(+id, updateConcesionarioDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.concesionariosService.remove(+id);
  }
}