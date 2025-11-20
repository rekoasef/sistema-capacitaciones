// backend/src/grupos/grupos.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete, 
  Patch, 
  UseGuards, 
} from '@nestjs/common';
import { GruposService } from './grupos.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto'; 
import { AuthGuard } from '@nestjs/passport'; 

@Controller('grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  // POST /grupos
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createGrupoDto: CreateGrupoDto) {
    return this.gruposService.create(createGrupoDto);
  }

  // GET /grupos (PÚBLICO)
  @Get()
  findAll() {
    return this.gruposService.findAll();
  }
  
  // --- NUEVO ENDPOINT PARA FASE 6.1 (R3) ---
  @Get(':id/inscriptos')
  @UseGuards(AuthGuard('jwt'))
  findInscriptos(@Param('id') id: string) {
    return this.gruposService.findInscriptosByGrupo(+id);
  }

  // GET /grupos/:id (PÚBLICO)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gruposService.findOne(+id);
  }

  // PATCH /grupos/:id (PROTEGIDO)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateGrupoDto: UpdateGrupoDto) {
    return this.gruposService.update(+id, updateGrupoDto);
  }

  // DELETE /grupos/:id (PROTEGIDO)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.gruposService.remove(+id);
  }
}