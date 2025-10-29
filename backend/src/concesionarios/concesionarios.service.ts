// src/concesionarios/concesionarios.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConcesionariosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    // Simplemente devuelve todos los concesionarios ordenados por nombre
    return this.prisma.concesionario.findMany({
      orderBy: { nombre: 'asc' },
    });
  }
}