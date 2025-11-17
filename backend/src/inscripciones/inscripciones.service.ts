// backend/src/inscripciones/inscripciones.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto'; // <-- 1. Importar DTO
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

  findAll() {
    return this.prisma.inscripcion.findMany({
      include: {
        concesionario: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  }

  async findOne(id: number) {
    // <-- 2. Añadimos verificación de existencia
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: { id },
    });
    if (!inscripcion) {
      throw new NotFoundException(`La inscripción con ID ${id} no fue encontrada.`);
    }
    return inscripcion;
  }

  // --- ¡NUEVO MÉTODO DE ACTUALIZACIÓN! ---
  async update(id: number, updateInscripcionDto: UpdateInscripcionDto) {
    // Primero, verificar que la inscripción exista
    await this.findOne(id);
    
    // Luego, actualizar
    return this.prisma.inscripcion.update({
      where: { id },
      data: updateInscripcionDto,
    });
  }

  // --- ¡NUEVO MÉTODO DE ELIMINACIÓN! ---
  async remove(id: number) {
    // Primero, verificar que la inscripción exista
    await this.findOne(id);

    // Luego, borrar
    return this.prisma.inscripcion.delete({
      where: { id },
    });
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
      Concesionario: insc.concesionario.nombre,
      Info_Adicional: insc.informacionAdicional || 'N/A',
      Capacitacion: insc.grupo.capacitacion.nombre,
      Fecha_Grupo: new Date(insc.grupo.fechaInicio).toLocaleDateString('es-AR'),
    }));
    return Papa.unparse(dataParaCsv);
  }
}