// backend/src/concesionarios/concesionarios.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConcesionarioDto } from './dto/create-concesionario.dto';
import { UpdateConcesionarioDto } from './dto/update-concesionario.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConcesionariosService {
  constructor(private prisma: PrismaService) {}

  async create(createConcesionarioDto: CreateConcesionarioDto) {
    try {
      return await this.prisma.concesionario.create({
        data: createConcesionarioDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe un concesionario con este nombre.');
        }
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.concesionario.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const concesionario = await this.prisma.concesionario.findUnique({
      where: { id },
    });
    if (!concesionario) {
      throw new NotFoundException(`Concesionario con ID ${id} no encontrado.`);
    }
    return concesionario;
  }

  async update(id: number, updateConcesionarioDto: UpdateConcesionarioDto) {
    await this.findOne(id); // Asegura que exista
    try {
      return await this.prisma.concesionario.update({
        where: { id },
        data: updateConcesionarioDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe un concesionario con este nombre.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id); // Asegura que exista
    try {
      return await this.prisma.concesionario.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ConflictException(
            'No se puede eliminar este concesionario porque tiene inscripciones asociadas.',
          );
        }
      }
      throw error;
    }
  }

  // --- ¡NUEVO MÉTODO DE REPORTE! ---
  async getReporte(id: number) {
    const concesionario = await this.prisma.concesionario.findUnique({
      where: { id },
      include: {
        // Incluir todas las inscripciones de este concesionario
        inscripciones: {
          orderBy: { createdAt: 'desc' }, // Ordenar por más reciente
          include: {
            // Para cada inscripción, incluir el grupo
            grupo: {
              include: {
                // Y para cada grupo, incluir la capacitación
                capacitacion: true,
              },
            },
          },
        },
      },
    });

    if (!concesionario) {
      throw new NotFoundException(`Concesionario con ID ${id} no encontrado.`);
    }

    return concesionario;
  }
}