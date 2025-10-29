// backend/src/grupos/grupos.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto'; // <-- 1. Importa el new DTO

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
          cuposRestantes: cuposRestantes > 0 ? cuposRestantes : 0,
        };
      }),
    );
    return gruposConCupos;
  }

  findOne(id: number) {
    return this.prisma.grupo.findUnique({
      where: { id },
    });
  }

  // --- ¡NUEVO MÉTODO DE ACTUALIZACIÓN! ---
  update(id: number, updateGrupoDto: UpdateGrupoDto) {
    // Preparamos los datos, convirtiendo las fechas si es que vienen
    const data: any = { ...updateGrupoDto };
    if (updateGrupoDto.fechaInicio) {
      data.fechaInicio = new Date(updateGrupoDto.fechaInicio);
    }
    if (updateGrupoDto.fechaFin) {
      data.fechaFin = new Date(updateGrupoDto.fechaFin);
    }
    if (updateGrupoDto.cupoMaximo) {
      data.cupoMaximo = Number(updateGrupoDto.cupoMaximo);
    }

    return this.prisma.grupo.update({
      where: { id },
      data: data,
    });
  }

  // --- ¡NUEVO MÉTODO DE ELIMINACIÓN! ---
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
}