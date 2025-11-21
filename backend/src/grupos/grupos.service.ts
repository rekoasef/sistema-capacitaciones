// backend/src/grupos/grupos.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'; 
import { PrismaService } from '../../prisma/prisma.service'; // Ruta verificada
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto'; 
import * as Papa from 'papaparse'; 
import { Prisma } from '@prisma/client';

@Injectable()
export class GruposService {
  constructor(private prisma: PrismaService) {}

  // TAREA 9.2: Modificado para usar Segmentos
  async create(createGrupoDto: CreateGrupoDto) {
    const { segmentos, ...rest } = createGrupoDto;
    
    // FIX: El DTO solo debería enviar cupoMaximo y capacitacionId, no se necesita desestructuración profunda
    return this.prisma.grupo.create({
      data: {
        cupoMaximo: Number(createGrupoDto.cupoMaximo),
        capacitacionId: createGrupoDto.capacitacionId,
        segmentos: {
            create: segmentos.map(s => ({
                dia: new Date(s.dia),
                horaInicio: s.horaInicio,
                horaFin: s.horaFin,
            }))
        }
      },
    });
  }

  // Helper para tipar el retorno con segmentos y conteo
  private getGrupoWithSegmentsAndCounts() {
      // FIX: Definición explícita de los includes para Prisma
      return this.prisma.grupo.findMany({
          include: {
              capacitacion: { select: { nombre: true, instructor: true } },
              segmentos: { orderBy: { dia: 'asc' } },
              _count: { select: { inscripciones: true } },
          },
          orderBy: { id: 'desc' },
      });
  }

  async findAll() {
    const grupos = await this.getGrupoWithSegmentsAndCounts();
    
    // Mapear para exponer las fechas derivadas y el conteo
    const gruposMapeados = grupos.map(grupo => {
        const fechaInicio = grupo.segmentos[0]?.dia;
        const fechaFin = grupo.segmentos[grupo.segmentos.length - 1]?.dia;
        const inscripcionesCount = grupo._count.inscripciones;
        const cuposRestantes = grupo.cupoMaximo - inscripcionesCount;
        
        return {
            ...grupo,
            fechaInicio, 
            fechaFin, 
            inscripcionesCount,
            cuposRestantes: cuposRestantes > 0 ? cuposRestantes : 0,
        };
    });
    return gruposMapeados;
  }
  
  // TAREA 9.2: Modificado para incluir Segmentos
  async findOne(id: number) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
      include: {
        capacitacion: { select: { nombre: true, instructor: true, ubicacion: true } },
        segmentos: { orderBy: { dia: 'asc' } }, // FIX: Incluir Segmentos
        _count: { select: { inscripciones: true } },
      },
    });
    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado.`);
    }

    const fechaInicio = grupo.segmentos[0]?.dia;
    const fechaFin = grupo.segmentos[grupo.segmentos.length - 1]?.dia;
    const inscripcionesCount = grupo._count.inscripciones;
    
    return {
        ...grupo,
        fechaInicio, 
        fechaFin, 
        inscripcionesCount,
    };
  }

  // TAREA 9.2: MODIFICADO: Ahora maneja la actualización de Grupo y Segmentos
  async update(id: number, updateGrupoDto: UpdateGrupoDto & { segmentos?: any[] }) {
    const grupoExistente = await this.prisma.grupo.findUnique({ where: { id } }); 
    if (!grupoExistente) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado.`);
    }

    const { segmentos, ...dataGrupo } = updateGrupoDto;
    
    await this.prisma.grupo.update({
        where: { id },
        data: dataGrupo,
    });

    // 2. Actualizar/Crear/Eliminar Segmentos (Solo si vienen segmentos)
    if (segmentos) { 
        // Eliminamos todos los segmentos anteriores y creamos los nuevos
        await this.prisma.$transaction([
            this.prisma.grupoSegmento.deleteMany({ where: { grupoId: id } }), // FIX: Uso correcto del modelo grupoSegmento
            this.prisma.grupoSegmento.createMany({ 
                data: segmentos.map(s => ({
                    dia: new Date(s.dia),
                    horaInicio: s.horaInicio,
                    horaFin: s.horaFin,
                    grupoId: id,
                }))
            })
        ]);
    }
    
    return this.prisma.grupo.findUnique({ where: { id } }); // Devolver el grupo actualizado
  }

  // TAREA 9.2: Modificado para eliminar Segmentos en cascada
  async remove(id: number) {
    return this.prisma.$transaction(async (prisma) => {
      // 1. Borrar Segmentos
      await prisma.grupoSegmento.deleteMany({ where: { grupoId: id } }); // FIX: Uso correcto
      // 2. Borrar inscripciones
      await prisma.inscripcion.deleteMany({ where: { grupoId: id } });
      // 3. Borrar el grupo
      return prisma.grupo.delete({ where: { id } });
    });
  }
  
  // TAREA 9.2: Modificado para usar Segmentos en la obtención de inscritos (Fase 6.2)
  async findInscriptosByGrupo(id: number) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
      include: {
        capacitacion: { select: { id: true, nombre: true, ubicacion: true } },
        segmentos: { orderBy: { dia: 'asc' } },
        inscripciones: {
          include: { concesionario: true }, 
          orderBy: { nombreUsuario: 'asc' },
        },
        _count: { select: { inscripciones: true } },
      },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado.`);
    }

    const fechaInicio = grupo.segmentos[0]?.dia;
    const fechaFin = grupo.segmentos[grupo.segmentos.length - 1]?.dia;
    const totalInscripciones = grupo._count.inscripciones;
    
    // Cálculo de KPIs y retorno de estructura
    const kpis = {
      totalInscripciones: totalInscripciones,
      asistencias: grupo.inscripciones.filter(i => i.estado === 'ASISTIÓ').length,
      ausencias: grupo.inscripciones.filter(i => i.estado === 'AUSENTE').length,
      pendientes: grupo.inscripciones.filter(i => i.estado === 'PENDIENTE').length,
      cupoMaximo: grupo.cupoMaximo
    };

    return {
      ...grupo,
      fechaInicio,
      fechaFin,
      kpis: kpis,
      // Mapeo de inscripciones (usado en el frontend)
      inscripciones: grupo.inscripciones.map(insc => ({
          id: insc.id,
          nombreUsuario: insc.nombreUsuario,
          emailUsuario: insc.emailUsuario,
          telefono: insc.telefono,
          estado: insc.estado,
          // FIX: Renombrada a 'concesionario' para coincidir con la interfaz del front
          concesionario: insc.concesionario, 
          createdAt: insc.createdAt.toISOString(),
      })),
    };
  }

  // TAREA 9.2: Modificado para usar Segmentos en la exportación (R3)
  async exportGrupoToCsv(id: number): Promise<string> {
    const grupoDetail = await this.prisma.grupo.findUnique({
      where: { id },
      include: {
        capacitacion: { select: { nombre: true, ubicacion: true } },
        segmentos: { orderBy: { dia: 'asc' } },
      },
    });

    if (!grupoDetail) {
      throw new NotFoundException(`Grupo con ID ${id} no existe.`);
    }

    const inscripciones = await this.prisma.inscripcion.findMany({
      where: { grupoId: id },
      include: { concesionario: true },
      orderBy: { createdAt: 'asc' },
    });

    if (inscripciones.length === 0) {
      return `No hay inscriptos en el grupo ${grupoDetail.capacitacion.nombre} (ID ${id}) para exportar.`;
    }

    const segmentosTexto = grupoDetail.segmentos.map((s, index) => {
        const dia = new Date(s.dia).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `Día ${index + 1}: ${dia} (${s.horaInicio}-${s.horaFin})`;
    }).join('; ');

    const dataParaCsv = inscripciones.map((insc) => ({
      Nombre_Participante: insc.nombreUsuario,
      Email_Participante: insc.emailUsuario,
      Telefono: insc.telefono || 'N/A',
      Concesionario: insc.concesionario?.nombre || 'N/A', 
      Estado_Asistencia: insc.estado,
      Capacitacion: grupoDetail.capacitacion.nombre,
      Ubicacion: grupoDetail.capacitacion.ubicacion,
      Detalle_Horarios: segmentosTexto, // Nuevo campo detallado
      Fecha_Inscripcion: new Date(insc.createdAt).toLocaleString('es-AR'),
    }));

    return Papa.unparse(dataParaCsv);
  }
}