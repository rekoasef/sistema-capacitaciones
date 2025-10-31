// backend/src/capacitaciones/capacitaciones.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto'; // <-- 1. Importar el DTO
import * as Papa from 'papaparse';

@Injectable()
export class CapacitacionesService {
  constructor(private prisma: PrismaService) {}

  async create(createCapacitacionDto: CreateCapacitacionDto) {
    const { grupos, ...capacitacionData } = createCapacitacionDto;
    return this.prisma.$transaction(async (prisma) => {
      const nuevaCapacitacion = await prisma.capacitacion.create({
        data: capacitacionData,
      });
      if (grupos && grupos.length > 0) {
        await prisma.grupo.createMany({
          data: grupos.map((grupo) => ({
            fechaInicio: new Date(grupo.fechaInicio),
            fechaFin: new Date(grupo.fechaFin),
            cupoMaximo: Number(grupo.cupoMaximo),
            capacitacionId: nuevaCapacitacion.id,
          })),
        });
      }
      return nuevaCapacitacion;
    });
  }

  findAll() {
    return this.prisma.capacitacion.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.capacitacion.findUnique({
      where: { id },
      include: {
        grupos: {
          orderBy: {
            fechaInicio: 'asc',
          },
        },
      },
    });
  }

  async findOneForAdmin(id: number) {
    const capacitacion = await this.prisma.capacitacion.findUnique({
      where: { id },
      include: {
        grupos: {
          orderBy: {
            fechaInicio: 'asc',
          },
        },
      },
    });
    
    if (!capacitacion) {
      throw new NotFoundException(`La capacitación con ID ${id} no fue encontrada.`);
    }
    return capacitacion;
  }

  // --- ¡NUEVO MÉTODO DE ACTUALIZACIÓN! ---
  // Este método solo actualiza los datos *propios* de la capacitación.
  // La gestión de grupos (crear/borrar/editar) se maneja en GruposService.
  async update(id: number, updateCapacitacionDto: UpdateCapacitacionDto) {
    // Verificamos si existe primero
    const capacitacion = await this.prisma.capacitacion.findUnique({
      where: { id },
    });
    if (!capacitacion) {
      throw new NotFoundException(`La capacitación con ID ${id} no fue encontrada.`);
    }

    return this.prisma.capacitacion.update({
      where: { id },
      data: updateCapacitacionDto,
    });
  }

  remove(id: number) {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.inscripcion.deleteMany({
        where: { grupo: { capacitacionId: id } },
      });
      await prisma.grupo.deleteMany({
        where: { capacitacionId: id },
      });
      return prisma.capacitacion.delete({
        where: { id },
      });
    });
  }

  async exportCapacitacionToCsv(id: number): Promise<string> {
    const capacitacion = await this.prisma.capacitacion.findUnique({
      where: { id },
    });
    if (!capacitacion) {
      throw new NotFoundException(`La capacitación con ID ${id} no existe.`);
    }
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: {
        grupo: {
          capacitacionId: id,
        },
      },
      include: {
        grupo: true,
        concesionario: true,
      },
    });
    if (inscripciones.length === 0) {
      return 'No hay inscriptos en esta capacitación para exportar.';
    }
    const dataParaCsv = inscripciones.map((insc) => ({
      Nombre_Participante: insc.nombreUsuario,
      Email_Participante: insc.emailUsuario,
      Telefono: insc.telefono || 'N/A',
      Concesionario: insc.concesionario.nombre,
      Fecha_Grupo: new Date(insc.grupo.fechaInicio).toLocaleDateString('es-AR'),
      Info_Adicional: insc.informacionAdicional || 'N/A',
    }));
    return Papa.unparse(dataParaCsv);
  }

  async findInscriptosByCapacitacion(id: number) {
    return this.prisma.inscripcion.findMany({
      where: {
        grupo: {
          capacitacionId: id,
        },
      },
      include: {
        concesionario: true,
      },
      orderBy: {
        nombreUsuario: 'asc',
      },
    });
  }
}