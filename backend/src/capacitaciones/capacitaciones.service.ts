// backend/src/capacitaciones/capacitaciones.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCapacitacionDto } from './dto/create-capacitacion.dto';
import { UpdateCapacitacionDto } from './dto/update-capacitacion.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CapacitacionesService {
  constructor(private prisma: PrismaService) {}

  // Adaptado para manejar 'grupos' con 'segmentos' anidados.
  async create(createCapacitacionDto: CreateCapacitacionDto) {
    const { grupos, ...dataCapacitacion } = createCapacitacionDto;

    // 1. Validaciones
    if (!grupos || grupos.length === 0) {
      throw new BadRequestException('Se debe especificar al menos un grupo.');
    }

    grupos.forEach((grupo, index) => {
      if (!grupo.segmentos || grupo.segmentos.length === 0) {
        throw new BadRequestException(
          `El Grupo ${index + 1} debe tener al menos un segmento de día/hora.`,
        );
      }
      if (grupo.cupoMaximo <= 0) {
        throw new BadRequestException(
          `El cupo máximo del Grupo ${index + 1} debe ser mayor a cero.`,
        );
      }
    });

    // 2. Preparar datos para Prisma (conversión de anidación)
    const gruposData = grupos.map((grupo) => ({
      cupoMaximo: grupo.cupoMaximo,
      segmentos: {
        create: grupo.segmentos.map((segmento) => ({
          dia: new Date(segmento.dia), // Convertir a Date
          horaInicio: segmento.horaInicio,
          horaFin: segmento.horaFin,
        })),
      },
    }));

    // 3. Crear Capacitación y sus Grupos anidados
    return this.prisma.capacitacion.create({
      data: {
        ...dataCapacitacion,
        grupos: {
          create: gruposData,
        },
      },
      include: {
        grupos: {
          include: {
            segmentos: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.capacitacion.findMany({
      include: {
        grupos: {
          include: {
            inscripciones: true,
            segmentos: { orderBy: { dia: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const capacitacion = await this.prisma.capacitacion.findUnique({
      where: { id },
      include: {
        grupos: {
          include: {
            inscripciones: true,
            segmentos: { orderBy: { dia: 'asc' } },
          },
        },
      },
    });

    if (!capacitacion) {
      throw new NotFoundException(`Capacitación con ID ${id} no encontrada.`);
    }
    return capacitacion;
  }

  // RE-IMPLEMENTACIÓN DE UPDATE (SOLUCIONA ERROR TS2339)
  async update(id: number, updateCapacitacionDto: UpdateCapacitacionDto) {
    // Nota: La gestión compleja de `grupos` y `segmentos` anidados
    // durante una actualización (PATCH) será abordada completamente
    // en la Fase 9.3/9.4. Por ahora, solo permitimos actualizar los
    // campos principales de la Capacitación.
    const { grupos, ...dataCapacitacion } = updateCapacitacionDto;

    try {
      // Actualizar la Capacitación (campos principales)
      const updatedCapacitacion = await this.prisma.capacitacion.update({
        where: { id },
        data: dataCapacitacion,
      });

      // Si se enviaron datos de grupos, ignoramos la actualización de grupos/segmentos
      // ya que este endpoint no está diseñado para manejar esa complejidad.
      if (grupos) {
        console.warn(
          'ADVERTENCIA: Se ignoraron los datos de grupos/segmentos. La gestión de grupos debe hacerse a través de endpoints específicos (ej: grupos.controller.ts) o se implementará lógica de diffing en Fase 9.4.',
        );
      }

      return updatedCapacitacion;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Capacitación con ID ${id} no encontrada.`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    // Al eliminar una capacitación, se usa la eliminación en cascada
    // (ON DELETE CASCADE) para grupos, segmentos e inscripciones.
    try {
      return await this.prisma.capacitacion.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Capacitación con ID ${id} no encontrada.`);
      }
      throw error;
    }
  }

  // Actualizado para usar la nueva estructura de Segmentos para filtrar por fecha futura
  async findPublicCapacitaciones() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Para comparar solo la fecha

    const capacitaciones = await this.prisma.capacitacion.findMany({
      where: {
        visible: true,
        grupos: {
          some: {
            // Un grupo es visible si tiene al menos un segmento en el futuro (o hoy)
            segmentos: {
              some: {
                dia: {
                  gte: today.toISOString(),
                },
              },
            },
          },
        },
      },
      include: {
        grupos: {
          where: {
            // Filtro de grupos: sólo los que tengan segmentos futuros
            segmentos: {
              some: {
                dia: {
                  gte: today.toISOString(),
                },
              },
            },
          },
          include: {
            inscripciones: {
              select: { id: true },
            },
            segmentos: {
              orderBy: { dia: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filtrar en memoria para asegurar que sólo se muestren los grupos con cupo disponible
    return capacitaciones
      .map((cap) => ({
        ...cap,
        grupos: cap.grupos
          .map((grupo) => ({
            ...grupo,
            cupoRestante: grupo.cupoMaximo - grupo.inscripciones.length,
          }))
          .filter((grupo) => grupo.cupoRestante > 0),
      }))
      .filter((cap) => cap.grupos.length > 0); // Ocultar capacitaciones que ya no tengan grupos disponibles
  }
}