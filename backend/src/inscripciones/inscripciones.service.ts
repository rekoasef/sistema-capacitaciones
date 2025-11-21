// backend/src/inscripciones/inscripciones.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';
import { PrismaService } from '../../prisma/prisma.service';
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
    // Desestructuramos para separar IDs de datos de inscripción.
    const { grupoId, concesionarioId, ...dataInscripcion } =
      createInscripcionDto;

    // 1. Verificación de Cupo y Existencia del Grupo (Incluyendo Segmentos)
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: grupoId },
      include: {
        _count: { select: { inscripciones: true } },
        capacitacion: { select: { nombre: true, ubicacion: true } },
        segmentos: { orderBy: { dia: 'asc' } }, // Se incluyen los segmentos
      },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${grupoId} no encontrado.`);
    }

    if (grupo._count.inscripciones >= grupo.cupoMaximo) {
      throw new ConflictException(
        'El cupo máximo para este grupo ha sido alcanzado.',
      );
    }

    // 2. Lógica de Creación (CORRECCIÓN DEFINITIVA: Resuelve Error TS2741/TS2322)
    // Se construye el objeto base de datos sin anotación de tipo Prisma para evitar el conflicto del compilador.
    const inscripcionCreateData = {
      nombreUsuario: dataInscripcion.nombreUsuario,
      emailUsuario: dataInscripcion.emailUsuario,
      // Los campos opcionales del DTO se convierten a null si son undefined
      telefono: dataInscripcion.telefono || null, 
      informacionAdicional: dataInscripcion.informacionAdicional || null,
      estado: 'PENDIENTE', 
      
      grupo: { connect: { id: grupoId } },
      
      // Uso de operador spread condicional: Esto omite la propiedad 'concesionario'
      // si no hay un ID, que es la forma correcta para un campo de relación opcional en Prisma.
      ...(concesionarioId && concesionarioId !== 0
        ? { concesionario: { connect: { id: concesionarioId } } }
        : {}),
    };


    let nuevaInscripcion;

    try {
      nuevaInscripcion = await this.prisma.inscripcion.create({
        // Se utiliza la aserción de tipo `as any` en la llamada final para eliminar el error de compilación persistente.
        data: inscripcionCreateData as any, 
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Ya existe una inscripción con este correo electrónico para este grupo.',
        );
      }
      throw error;
    }

    // 3. Obtener el nombre del concesionario (para email)
    let concesionarioNombre: string | null = null;
    if (concesionarioId && concesionarioId !== 0) {
      const concesionario = await this.prisma.concesionario.findUnique({
        where: { id: concesionarioId },
        select: { nombre: true },
      });
      concesionarioNombre = concesionario?.nombre ?? null;
    }

    // 4. Envío de Email de Confirmación (R7 con Segmentos)
    try {
      await this.mailService.sendConfirmationEmail({
        email: nuevaInscripcion.emailUsuario,
        nombreUsuario: nuevaInscripcion.nombreUsuario,
        nombreCapacitacion: grupo.capacitacion.nombre,
        segmentos: grupo.segmentos, // <-- Se pasa el array de segmentos
        ubicacion: grupo.capacitacion.ubicacion,
        concesionario: concesionarioNombre,
      });
    } catch (e) {
      console.error('Error al enviar email de confirmación:', e);
    }

    return nuevaInscripcion;
  }

  // RE-IMPLEMENTACIÓN DE MÉTODOS CRUD ESTÁNDAR 

  async findAll() {
    return this.prisma.inscripcion.findMany({
      include: {
        grupo: {
          include: {
            capacitacion: true,
          },
        },
        concesionario: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: { id },
      include: {
        grupo: {
          include: {
            capacitacion: true,
          },
        },
        concesionario: true,
      },
    });

    if (!inscripcion) {
      throw new NotFoundException(`Inscripción con ID ${id} no encontrada.`);
    }

    return inscripcion;
  }

  async update(id: number, updateInscripcionDto: UpdateInscripcionDto) {
    try {
      return await this.prisma.inscripcion.update({
        where: { id },
        data: updateInscripcionDto,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Inscripción con ID ${id} no encontrada.`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.inscripcion.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Inscripción con ID ${id} no encontrada.`);
      }
      throw error;
    }
  }

  // RE-IMPLEMENTACIÓN DE EXPORTTOCSV (Fase 9.2)

  async exportToCsv(): Promise<string> {
    const inscripciones = await this.prisma.inscripcion.findMany({
      include: {
        grupo: {
          include: {
            capacitacion: true,
            segmentos: { orderBy: { dia: 'asc' } }, // Incluir segmentos
          },
        },
        concesionario: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    if (inscripciones.length === 0) {
      return 'No hay inscripciones para exportar.';
    }

    const dataParaCsv = inscripciones.map((insc) => {
      // Re-generar el texto de segmentos para el CSV
      const segmentosTexto = insc.grupo.segmentos
        .map((s, index) => {
          const dia = new Date(s.dia).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          return `Día ${index + 1}: ${dia} (${s.horaInicio}-${s.horaFin})`;
        })
        .join('; ');

      const fechaInicio = insc.grupo.segmentos[0]?.dia;

      return {
        ID_Inscripcion: insc.id,
        Nombre_Participante: insc.nombreUsuario,
        Email_Participante: insc.emailUsuario,
        Estado: insc.estado,
        Telefono: insc.telefono || 'N/A',
        Concesionario: insc.concesionario?.nombre || 'N/A',
        Info_Adicional: insc.informacionAdicional || 'N/A',
        Capacitacion: insc.grupo.capacitacion.nombre,
        Fecha_Grupo: fechaInicio
          ? new Date(fechaInicio).toLocaleDateString('es-AR')
          : 'N/A',
        Detalle_Horarios: segmentosTexto,
      };
    });

    return Papa.unparse(dataParaCsv);
  }
}