// backend/src/app.module.ts

import { Module } from '@nestjs/common';
// Se fue el ConfigModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CapacitacionesModule } from './capacitaciones/capacitaciones.module';
import { GruposModule } from './grupos/grupos.module';
import { PrismaModule } from '../prisma/prisma.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ConcesionariosModule } from './concesionarios/concesionarios.module';

@Module({
  imports: [
    // Ya no está ConfigModule.forRoot()
    CapacitacionesModule,
    GruposModule,
    PrismaModule,
    InscripcionesModule,
    MailModule,
    AuthModule,
    DashboardModule,
    ConcesionariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}