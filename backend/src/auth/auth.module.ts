// backend/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
// Se fueron ConfigModule y ConfigService de las importaciones

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    // Volvemos al método de registro simple y síncrono
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Intentará leer la variable directamente
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}