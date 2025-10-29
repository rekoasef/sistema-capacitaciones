// src/dashboard/dashboard.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // Usamos Promise.all para ejecutar todas las consultas a la base de datos en paralelo,
    // lo cual es mucho más rápido que hacerlas una por una.
    const [
      totalInscriptos,
      totalCapacitaciones,
      capacitacionesMasDemandadas,
    ] = await Promise.all([
      // 1. Contar el total de inscripciones
      this.prisma.inscripcion.count(),
      
      // 2. Contar el total de capacitaciones
      this.prisma.capacitacion.count(),
      
      // 3. Agrupar inscripciones por grupo para encontrar los más populares
      this.prisma.inscripcion.groupBy({
        by: ['grupoId'],
        _count: {
          id: true, // Contamos las inscripciones (usando el campo 'id')
        },
        orderBy: {
          _count: {
            id: 'desc', // Ordenamos de mayor a menor
          },
        },
        take: 5, // Traemos solo el top 5
      }),
    ]);

    // Ahora, enriquecemos los datos de las capacitaciones más demandadas
    // para obtener sus nombres, ya que groupBy solo devuelve IDs.
    const rankingCapacitaciones = await Promise.all(
      capacitacionesMasDemandadas.map(async (item) => {
        const grupo = await this.prisma.grupo.findUnique({
          where: { id: item.grupoId },
          include: { capacitacion: true },
        });
        return {
          nombre: grupo?.capacitacion.nombre || 'Desconocido',
          inscriptos: item._count.id,
        };
      }),
    );

    // Devolvemos el objeto final con todas las estadísticas
    return {
      totalInscriptos,
      totalCapacitaciones,
      rankingCapacitaciones,
    };
  }
}