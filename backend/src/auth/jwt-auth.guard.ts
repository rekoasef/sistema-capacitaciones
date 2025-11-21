// backend/src/auth/jwt-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard extiende AuthGuard('jwt').
 * Este es el guardián estándar que se utiliza para proteger rutas.
 * Delega la lógica de validación del token al JwtStrategy.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}