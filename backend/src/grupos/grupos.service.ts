// backend/src/grupos/grupos.service.ts

import { Injectable, NotFoundException } from '@nestjs/common'; 
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto'; 
import { Prisma } from '@prisma/client'; 

@Injectable()
export class GruposService {
  constructor(private prisma: PrismaService) {}

  create(createGrupoDto: CreateGrupoDto) {
    // Convertimos las fechas string a objetos Date
    return this.prisma.grupo.create({
      data: {
        ...createGrupoDto,
        fechaInicio: new Date(createGrupoDto.fechaInicio),
        fechaFin: new Date(createGrupoDto.fechaFin),
      },
    });
  }

  async findAll() {
    const grupos = await this.prisma.grupo.findMany();
    const gruposConCupos = await Promise.all(
      grupos.map(async (grupo) => {
        const inscripcionesCount = await this.prisma.inscripcion.count({
          where: { grupoId: grupo.id },
        });
        const cuposRestantes = grupo.cupoMaximo - inscripcionesCount;
        return {
          ...grupo,
          inscripcionesCount: inscripcionesCount, 
          cuposRestantes: cuposRestantes > 0 ? cuposRestantes : 0,
        };
      }),
    );
    return gruposConCupos;
  }
  
  findOne(id: number) {
    return this.prisma.grupo.findUnique({
      where: { id },
      include: {
        _count: {
          select: { inscripciones: true },
        },
      },
    });
  }

  update(id: number, updateGrupoDto: UpdateGrupoDto) {
    // Preparamos los datos, convirtiendo las fechas si es que vienen
    const data: any = { ...updateGrupoDto };
    
    const updateDto = updateGrupoDto as any; 
    
    if (updateDto.fechaInicio) {
      data.fechaInicio = new Date(updateDto.fechaInicio);
    }
    if (updateDto.fechaFin) {
      data.fechaFin = new Date(updateDto.fechaFin);
    }
    if (updateDto.cupoMaximo) {
      data.cupoMaximo = Number(updateDto.cupoMaximo);
    }

    return this.prisma.grupo.update({
      where: { id },
      data: data,
    });
  }

  remove(id: number) {
    // Usamos una transacción para asegurar que borremos todo lo relacionado
    return this.prisma.$transaction(async (prisma) => {
      // 1. Borrar todas las inscripciones asociadas a este grupo
      await prisma.inscripcion.deleteMany({
        where: { grupoId: id },
      });

      // 2. Borrar el grupo
      return prisma.grupo.delete({
        where: { id },
      });
    });
  }
  
  // --- NUEVO MÉTODO PARA FASE 6.1 (R3) ---
  async findInscriptosByGrupo(id: number) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
      include: {
        capacitacion: true, // Incluimos la capacitación para la navegación y contexto
        inscripciones: {
          orderBy: { createdAt: 'desc' },
          include: {
            concesionario: true, // Incluimos el concesionario
          },
        },
      },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado.`);
    }

    // Calculamos KPIs simples
    const totalInscripciones = grupo.inscripciones.length;
    const asistencias = grupo.inscripciones.filter(i => i.estado === 'ASISTIÓ').length;
    const ausencias = grupo.inscripciones.filter(i => i.estado === 'AUSENTE').length;
    // Bajas (eliminados) no se cuentan aquí, solo los estados activos.
    const pendientes = grupo.inscripciones.filter(i => i.estado === 'PENDIENTE').length;

    return {
      ...grupo,
      kpis: {
        totalInscripciones,
        asistencias,
        ausencias,
        pendientes,
        cupoMaximo: grupo.cupoMaximo
      }
    };
  }
}