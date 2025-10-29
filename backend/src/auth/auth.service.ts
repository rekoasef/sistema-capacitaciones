// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Método para registrar un nuevo administrador
  async signUp(createAdminDto: CreateAdminDto) {
    const { email, password } = createAdminDto;

    // 1. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10); // El 10 es el "costo" o "salt rounds"

    // 2. Guardar el nuevo admin en la base de datos
    const admin = await this.prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Por seguridad, no devolvemos la contraseña hasheada 
    const { password: _, ...result } = admin;
    return result;
    }

  // Método para validar si las credenciales son correctas
  async validateUser(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    const admin = await this.prisma.admin.findUnique({ where: { email } });

    // Comparamos la contraseña enviada con la hasheada en la BBDD
    if (admin && (await bcrypt.compare(password, admin.password))) {
      // Si son correctas, devolvemos el admin sin la contraseña
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }

  // Método para iniciar sesión y generar un token JWT
  async login(loginDto: LoginDto) {
    const admin = await this.validateUser(loginDto);
    if (!admin) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // El "payload" es la información que guardaremos dentro del token
    const payload = { email: admin.email, sub: admin.id };
    
    return {
      message: 'Inicio de sesión exitoso',
      access_token: this.jwtService.sign(payload),
    };
  }
}