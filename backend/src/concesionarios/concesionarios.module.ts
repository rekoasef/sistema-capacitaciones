// src/concesionarios/concesionarios.module.ts
import { Module } from '@nestjs/common';
import { ConcesionariosService } from './concesionarios.service';
import { ConcesionariosController } from './concesionarios.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConcesionariosController],
  providers: [ConcesionariosService],
})
export class ConcesionariosModule {}