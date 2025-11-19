// backend/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- AÑADIDO ConfigModule y ConfigService

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    // --- FIX: Registro Asíncrono para leer JWT_SECRET de forma confiable ---
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa ConfigModule para que ConfigService esté disponible
      useFactory: async (configService: ConfigService) => ({
        // Lee la variable JWT_SECRET de forma asíncrona y robusta
        secret: configService.get<string>('JWT_SECRET'), 
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService], // Inyecta ConfigService
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}