// backend/src/auth/auth.service.ts

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// import { CreateAdminDto } from './dto/create-admin.dto'; // <-- ELIMINADO (Ya no es necesario)

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });
    if (!admin) {
      throw new NotFoundException('El administrador no fue encontrado.');
    }
    const isPasswordMatching = await bcrypt.compare(pass, admin.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }
    const payload = { sub: admin.id, email: admin.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  /* --- MÉTODO ELIMINADO ---
  async signup(email: string, pass: string) {
    const hashedPassword = await bcrypt.hash(pass, 10);
    const admin = await this.prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    // No devolvemos la contraseña
    const { password, ...result } = admin;
    return result;
  }
  */
}