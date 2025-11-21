// backend/src/inscripciones/inscripciones.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';
import { MailService } from '../mail/mail.service';
import { Prisma } from '@prisma/client'; 
import * as Papa from 'papaparse';

@Injectable()
export class InscripcionesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createInscripcionDto: CreateInscripcionDto) {
    const { grupoId, concesionarioId, ...dataInscripcion } = createInscripcionDto;

    // 1. Verificación de Cupo y Existencia del Grupo (Incluyendo Segmentos)
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: grupoId },
      include: {
        _count: { select: { inscripciones: true } },
        capacitacion: { select: { nombre: true, ubicacion: true } },
        segmentos: { orderBy: { dia: 'asc' } } // FIX: Include segmentos para derivar fechas
      },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${grupoId} no encontrado.`);
    }

    if (grupo._count.inscripciones >= grupo.cupoMaximo) {
      throw new ConflictException('El grupo seleccionado está completo.');
    }

    let nuevaInscripcion;
    
    try {
        // 2. Creación de la Inscripción con manejo de error P2002
        nuevaInscripcion = await this.prisma.inscripcion.create({
            data: {
                ...dataInscripcion,
                grupo: { connect: { id: grupoId } },
                // FIX: La única forma de evitar el error TS2322 es usando la conexión si existe el ID.
                // Si el ID no existe o es 0 (nulo opcional), omitimos el campo 'concesionario' para que Prisma lo maneje.
                concesionario: concesionarioId && concesionarioId !== 0
                    ? { connect: { id: concesionarioId } }
                    : undefined, 
                estado: 'PENDIENTE', 
            },
        });

    } catch (error: any) {
        if (error.code === 'P2002') {
             throw new ConflictException('Ya estás registrado en este grupo con este correo.');
        }
        throw error;
    }


    // 3. Obtener el nombre del concesionario y Fechas Derivadas (para email)
    const segmentosOrdenados = grupo.segmentos.sort((a, b) => new Date(a.dia).getTime() - new Date(b.dia).getTime());
    const fechaInicio = segmentosOrdenados[0]?.dia;
    const fechaFin = segmentosOrdenados[segmentosOrdenados.length - 1]?.dia;
    
    let concesionarioNombre: string | null = null;
    if (concesionarioId && concesionarioId !== 0) {
      const concesionario = await this.prisma.concesionario.findUnique({
        where: { id: concesionarioId },
        select: { nombre: true },
      });
      concesionarioNombre = concesionario?.nombre ?? null; 
    }

    // 4. Envío de Email de Confirmación (R7)
    try {
      await this.mailService.sendConfirmationEmail({
        email: nuevaInscripcion.emailUsuario,
        nombreUsuario: nuevaInscripcion.nombreUsuario,
        nombreCapacitacion: grupo.capacitacion.nombre,
        fechaInicio: fechaInicio, 
        fechaFin: fechaFin,      
        ubicacion: grupo.capacitacion.ubicacion,
        concesionario: concesionarioNombre,
      });
    } catch (e) {
      console.error('Error al enviar email de confirmación:', e);
    }

    return nuevaInscripcion;
  }
  
  // FIX: Se reescriben los métodos para que coincidan con el Controller
  
  findAll() {
    return this.prisma.inscripcion.findMany({
        include: { grupo: true, concesionario: true },
        orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: { id },
      include: { grupo: true, concesionario: true },
    });
    if (!inscripcion) {
      throw new NotFoundException(`Inscripción con ID ${id} no encontrada.`);
    }
    return inscripcion;
  }

  async update(id: number, updateInscripcionDto: UpdateInscripcionDto) {
    const inscripcion = await this.prisma.inscripcion.findUnique({ where: { id } });
    if (!inscripcion) {
      throw new NotFoundException(`Inscripción con ID ${id} no encontrada.`);
    }

    if (updateInscripcionDto.estado && !['PENDIENTE', 'ASISTIÓ', 'AUSENTE', 'CANCELADA'].includes(updateInscripcionDto.estado)) {
      throw new BadRequestException('Estado de inscripción inválido.');
    }

    return this.prisma.inscripcion.update({
      where: { id },
      data: updateInscripcionDto,
    });
  }

  async remove(id: number) {
    const inscripcion = await this.prisma.inscripcion.findUnique({ where: { id } });
    if (!inscripcion) {
      throw new NotFoundException(`Inscripción con ID ${id} no encontrada.`);
    }
    return this.prisma.inscripcion.delete({ where: { id } });
  }

  async exportToCsv(): Promise<string> {
    const inscripciones = await this.prisma.inscripcion.findMany({
      include: {
        grupo: {
          include: {
            capacitacion: true,
          },
        },
        concesionario: true,
      },
    });
    if (inscripciones.length === 0) {
      return 'No hay inscripciones para exportar.';
    }
    const dataParaCsv = inscripciones.map((insc) => ({
      ID_Inscripcion: insc.id,
      Nombre_Participante: insc.nombreUsuario,
      Email_Participante: insc.emailUsuario,
      Estado: insc.estado,
      Telefono: insc.telefono || 'N/A',
      Concesionario: insc.concesionario?.nombre || 'N/A',
      Info_Adicional: insc.informacionAdicional || 'N/A',
      Capacitacion: insc.grupo.capacitacion.nombre,
      Fecha_Grupo: new Date(insc.grupo.fechaInicio).toLocaleDateString('es-AR'), // Se usa la fecha derivada
    }));
    return Papa.unparse(dataParaCsv);
  }
}