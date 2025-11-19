// backend/src/capacitaciones/capacitaciones.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';
import * as Papa from 'papaparse';
import { Prisma } from '@prisma/client'; 

@Injectable()
export class CapacitacionesService {
  constructor(private prisma: PrismaService) {}

  async create(createCapacitacionDto: CreateCapacitacionDto) {
    const { grupos, ...capacitacionData } = createCapacitacionDto;
    return this.prisma.$transaction(async (prisma) => {
      const nuevaCapacitacion = await prisma.capacitacion.create({
        data: {
          ...capacitacionData,
          visible: capacitacionData.visible ?? true, 
        },
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

  // --- PÚBLICO (FILTRADO) ---
  findAll() {
    return this.prisma.capacitacion.findMany({
      where: { visible: true }, 
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- ¡NUEVO MÉTODO DE ADMIN! ---
  findAllForAdmin() {
    return this.prisma.capacitacion.findMany({
      orderBy: { createdAt: 'desc' }, 
    });
  }

  // --- PÚBLICO (FILTRADO) ---
  async findOne(id: number) {
    const capacitacion = await this.prisma.capacitacion.findUnique({
      where: {
        id: id,
        visible: true, 
      },
      include: {
        grupos: {
          orderBy: {
            fechaInicio: 'asc',
          },
        },
      },
    });

    if (!capacitacion) {
      throw new NotFoundException(
        `Capacitación con ID ${id} no encontrada o no está visible.`,
      );
    }
    return capacitacion;
  }

  // --- ADMIN (SIN FILTRO) ---
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

  async update(id: number, updateCapacitacionDto: UpdateCapacitacionDto) {
    const capacitacion = await this.prisma.capacitacion.findUnique({
      where: { id },
    });
    if (!capacitacion) {
      throw new NotFoundException(`La capacitación con ID ${id} no fue encontrada.`);
    }
    
    const dataToUpdate: Prisma.CapacitacionUpdateInput = {
      ...updateCapacitacionDto,
    };
    
    // CORRECCIÓN: Usamos casting a 'any' para evitar el error TS2339
    const updateDto = updateCapacitacionDto as any; 
    
    if (updateDto.visible !== undefined) {
      dataToUpdate.visible = updateDto.visible;
    }
    
    return this.prisma.capacitacion.update({
      where: { id },
      data: dataToUpdate,
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