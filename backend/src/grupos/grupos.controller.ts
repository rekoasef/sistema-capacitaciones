// backend/src/grupos/grupos.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete, // <-- 1. Importa Delete
  Patch, // <-- 2. Importa Patch
  UseGuards, // <-- 3. Importa UseGuards
} from '@nestjs/common';
import { GruposService } from './grupos.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto'; // <-- 4. Importa el DTO de actualización
import { AuthGuard } from '@nestjs/passport'; // <-- 5. Importa el Guardia

@Controller('grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  // POST /grupos
  // ¡CORRECCIÓN DE SEGURIDAD! Protegemos esta ruta.
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createGrupoDto: CreateGrupoDto) {
    return this.gruposService.create(createGrupoDto);
  }

  // GET /grupos
  // PÚBLICO: Para el formulario de inscripción público.
  @Get()
  findAll() {
    return this.gruposService.findAll();
  }

  // GET /grupos/:id
  // PÚBLICO: Para el formulario de inscripción público.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gruposService.findOne(+id);
  }

  // --- ¡NUEVO MÉTODO DE ACTUALIZACIÓN! ---
  // PATCH /grupos/:id
  // PROTEGIDO: Solo un admin puede editar.
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateGrupoDto: UpdateGrupoDto) {
    return this.gruposService.update(+id, updateGrupoDto);
  }

  // --- ¡NUEVO MÉTODO DE ELIMINACIÓN! ---
  // DELETE /grupos/:id
  // PROTEGIDO: Solo un admin puede eliminar.
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.gruposService.remove(+id);
  }
}