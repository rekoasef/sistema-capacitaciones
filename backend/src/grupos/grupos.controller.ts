// backend/src/grupos/grupos.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// FIX: Se usa 'import type' para resolver el error TS1272 al usar el tipo en un decorador (@Res())
import type { Response } from 'express'; 

@UseGuards(JwtAuthGuard)
@Controller('grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Post()
  create(@Body() createGrupoDto: CreateGrupoDto) {
    return this.gruposService.create(createGrupoDto);
  }

  @Get()
  findAll() {
    return this.gruposService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gruposService.findOne(id);
  }

  // R3: Endpoint para la vista de gestión de inscritos por grupo (Fase 6.2)
  @Get(':id/inscriptos')
  findInscriptos(@Param('id', ParseIntPipe) id: number) {
    return this.gruposService.findInscriptosByGrupo(id);
  }

  // --- TAREA 6.3: Nuevo Endpoint de Exportación por Grupo (R3) ---
  @Get(':id/exportar/csv')
  async exportInscriptosGrupo(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
        const csvData = await this.gruposService.exportGrupoToCsv(id);
        
        // Si el resultado es el mensaje de error (no hay datos)
        if (csvData.startsWith('No hay inscriptos')) {
            return res.status(200).set({
                 'Content-Type': 'text/plain; charset=utf-8',
            }).send(csvData);
        }

        // Configuración de cabeceras para descarga de CSV
        res.set({
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="inscriptos_grupo_${id}.csv"`,
        }).send('\ufeff' + csvData); // El \ufeff es el BOM (Byte Order Mark) para UTF-8 en Excel
    } catch (error) {
        if (error instanceof NotFoundException) {
             throw new NotFoundException(error.message);
        }
        // Manejo de otros errores, por ejemplo, problemas con la base de datos o el CSV
        res.status(500).send('Error interno al generar el archivo CSV.');
    }
  }
  // --- FIN TAREA 6.3 ---

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGrupoDto: UpdateGrupoDto) {
    return this.gruposService.update(id, updateGrupoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gruposService.remove(id);
  }
}