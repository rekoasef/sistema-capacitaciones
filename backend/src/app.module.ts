// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

import { CapacitacionesModule } from './capacitaciones/capacitaciones.module';
import { ConcesionariosModule } from './concesionarios/concesionarios.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { MailModule } from './mail/mail.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GruposModule } from './grupos/grupos.module';
    
@Module({
  imports: [
    // --- CORRECCIÓN DEFINITIVA: Se especifica la ruta al archivo .env ---
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env', // <-- APUNTA AL ARCHIVO EN LA RAÍZ DEL PROYECTO
    }),
    PrismaModule,
    AuthModule,
    CapacitacionesModule,
    ConcesionariosModule,
    InscripcionesModule,
    MailModule,
    DashboardModule,
    GruposModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}