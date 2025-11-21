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
        // TAREA 9.2: Modificación de la CREACIÓN DE GRUPOS para segmentos
        for (const grupoData of grupos) {
             const { segmentos, ...rest } = grupoData;
             await prisma.grupo.create({
                data: {
                    cupoMaximo: Number(grupoData.cupoMaximo),
                    capacitacionId: nuevaCapacitacion.id,
                    // Creación anidada de los segmentos
                    segmentos: {
                        create: segmentos.map(s => ({
                            dia: new Date(s.dia), // Convertir a Date
                            horaInicio: s.horaInicio,
                            horaFin: s.horaFin,
                        }))
                    }
                }
             });
        }
      }
      return nuevaCapacitacion;
    });
  }

  // FIX: Métodos findAll/findAllForAdmin añadidos
  findAll() {
    return this.prisma.capacitacion.findMany({
      where: { visible: true }, 
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllForAdmin() {
    return this.prisma.capacitacion.findMany({
      orderBy: { createdAt: 'desc' }, 
    });
  }
  // FIN FIX

  // Helper para incluir segmentos y calcular el conteo de inscripciones
  private async getCapacitacionWithSegments(where: Prisma.CapacitacionWhereUniqueInput) {
    // Definimos el tipo de payload de Grupo para mapear correctamente
    type GrupoWithSegments = Prisma.GrupoGetPayload<{
      include: { 
        _count: { select: { inscripciones: true } },
        segmentos: { orderBy: { dia: 'asc' } },
      };
    }>;

    const capacitacion = await this.prisma.capacitacion.findUnique({
      where,
      // Usamos as any para evitar el error TS2353/TS2339 después de la regeneración
      include: {
        grupos: {
          orderBy: { id: 'asc' },
          include: {
            _count: { select: { inscripciones: true } },
            segmentos: { orderBy: { dia: 'asc' } },
          },
        } as any, 
      },
    });

    if (!capacitacion) return null;

    // Mapear para aplanar el conteo y calcular las fechas derivadas
    const gruposMapeados = (capacitacion.grupos as GrupoWithSegments[]).map(grupo => {
        const segmentosOrdenados = grupo.segmentos.sort((a, b) => new Date(a.dia).getTime() - new Date(b.dia).getTime());
        
        const fechaInicio = segmentosOrdenados[0]?.dia;
        const fechaFin = segmentosOrdenados[segmentosOrdenados.length - 1]?.dia;
        
        return {
            ...grupo,
            inscripcionesCount: grupo._count.inscripciones,
            fechaInicio, 
            fechaFin,    
        };
    });

    return { ...capacitacion, grupos: gruposMapeados };
  }

  async findOne(id: number) {
    const capacitacion = await this.getCapacitacionWithSegments({ id, visible: true });
    if (!capacitacion) {
      throw new NotFoundException(
        `Capacitación con ID ${id} no encontrada o no está visible.`,
      );
    }
    return capacitacion;
  }

  async findOneForAdmin(id: number) {
    const capacitacion = await this.getCapacitacionWithSegments({ id });
    if (!capacitacion) {
      throw new NotFoundException(`La capacitación con ID ${id} no fue encontrada.`);
    }
    return capacitacion;
  }

  remove(id: number) {
    return this.prisma.$transaction(async (prisma) => {
      // 1. Borrar Segmentos
      await prisma.grupoSegmento.deleteMany({ // FIX: Usa prisma.grupoSegmento
        where: { grupo: { capacitacionId: id } },
      });
      // 2. Borrar Inscripciones
      await prisma.inscripcion.deleteMany({
        where: { grupo: { capacitacionId: id } },
      });
      // 3. Borrar Grupos
      await prisma.grupo.deleteMany({
        where: { capacitacionId: id },
      });
      // 4. Borrar Capacitación
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
        grupo: {
            include: {
                segmentos: { orderBy: { dia: 'asc' } } 
            }
        },
        concesionario: true,
      },
    });
    
    if (inscripciones.length === 0) {
      return 'No hay inscriptos en esta capacitación para exportar.';
    }

    const dataParaCsv = inscripciones.map((insc) => {
        const segmentosTexto = insc.grupo.segmentos.map((s, index) => {
            const dia = new Date(s.dia).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            return `Día ${index + 1}: ${dia} (${s.horaInicio}-${s.horaFin})`;
        }).join('; ');

        return {
          Nombre_Participante: insc.nombreUsuario,
          Email_Participante: insc.emailUsuario,
          Telefono: insc.telefono || 'N/A',
          Concesionario: insc.concesionario?.nombre || 'N/A',
          Capacitacion: capacitacion.nombre,
          Detalle_Horarios: segmentosTexto, 
          Fecha_Inscripcion: new Date(insc.createdAt).toLocaleString('es-AR'),
        }
    });

    return Papa.unparse(dataParaCsv);
  }
}