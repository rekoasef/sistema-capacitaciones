// backend/src/auth/auth.service.ts

import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common'; // <-- Añadido Logger
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name); // <-- Añadido Logger

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    try { // <-- AÑADIDO TRY BLOCK
      const admin = await this.prisma.admin.findUnique({
        where: { email },
      });
      
      if (!admin) {
        throw new NotFoundException('El administrador no fue encontrado.');
      }
      
      // La comparación de contraseñas es el punto más débil
      const isPasswordMatching = await bcrypt.compare(pass, admin.password);
      
      if (!isPasswordMatching) {
        throw new UnauthorizedException('Credenciales incorrectas.');
      }
      
      const payload = { sub: admin.id, email: admin.email };
      
      return {
        // Si el código llega aquí, el JWT Secret es válido.
        access_token: await this.jwtService.signAsync(payload),
      };
      
    } catch (error) { // <-- AÑADIDO CATCH BLOCK
      // Registrar cualquier error inesperado de bcrypt o JWT antes de relanzar
      this.logger.error(`Fallo en el login para ${email}: ${error.message}`, error.stack);
      
      // Si ya es un error HTTP conocido, lo relanzamos
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Para cualquier otro error (como un crash de bcrypt o JWT), lo tratamos como credenciales incorrectas o error interno.
      throw new UnauthorizedException('Error interno de autenticación o credenciales inválidas.'); 
    }
  }

  /* --- MÉTODO ELIMINADO ---
  async signup(email: string, pass: string) {
    // ... (omitted)
  }
  */
}