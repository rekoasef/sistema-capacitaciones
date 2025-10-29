// backend/src/inscripciones/inscripciones.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { MailService } from '../mail/mail.service';
import * as Papa from 'papaparse';

@Injectable()
export class InscripcionesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createInscripcionDto: CreateInscripcionDto) {
    // ... (el método create se mantiene igual)
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: createInscripcionDto.grupoId },
      include: {
        capacitacion: true,
      },
    });
    if (!grupo) {
      throw new NotFoundException(
        `El grupo con ID ${createInscripcionDto.grupoId} no existe.`,
      );
    }
    const inscripcionesActuales = await this.prisma.inscripcion.count({
      where: { grupoId: createInscripcionDto.grupoId },
    });
    if (inscripcionesActuales >= grupo.cupoMaximo) {
      throw new ConflictException(
        'No quedan cupos disponibles para este grupo.',
      );
    }
    try {
      const nuevaInscripcion = await this.prisma.inscripcion.create({
        data: createInscripcionDto,
      });
      await this.mailService.enviarEmailConfirmacion(
        nuevaInscripcion.emailUsuario,
        nuevaInscripcion.nombreUsuario,
        grupo.capacitacion,
        grupo,
      );
      return nuevaInscripcion;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Este email ya está registrado en este grupo.',
        );
      }
      throw error;
    }
  }

  // --- ¡AQUÍ ESTÁ LA SOLUCIÓN! ---
  findAll() {
    return this.prisma.inscripcion.findMany({
      // Le decimos a Prisma que incluya los datos de la tabla relacionada
      include: {
        concesionario: true,
      },
      orderBy: {
        createdAt: 'desc', // Ordenamos por más reciente
      }
    });
  }

  findOne(id: number) {
    return this.prisma.inscripcion.findUnique({ where: { id } });
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
      Concesionario: insc.concesionario.nombre, // Ahora esto siempre funcionará
      Info_Adicional: insc.informacionAdicional || 'N/A',
      Capacitacion: insc.grupo.capacitacion.nombre,
      Fecha_Grupo: new Date(insc.grupo.fechaInicio).toLocaleDateString('es-AR'),
    }));
    return Papa.unparse(dataParaCsv);
  }
}