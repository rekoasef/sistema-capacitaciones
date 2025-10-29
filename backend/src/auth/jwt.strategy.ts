// backend/src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // --- ¡LA SOLUCIÓN! ---
    // 1. Obtenemos la clave secreta de las variables de entorno
    const secret = process.env.JWT_SECRET;

    // 2. Verificamos que la clave exista. Si no, la aplicación fallará al arrancar
    //    con un error claro, lo cual es una buena práctica de seguridad.
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }

    // 3. Solo si la clave existe, configuramos la estrategia.
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // Ahora TypeScript sabe que 'secret' es un string
    });
  }

  // Este método se mantiene igual
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}