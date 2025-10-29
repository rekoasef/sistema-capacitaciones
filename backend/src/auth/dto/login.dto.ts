// src/auth/dto/login.dto.ts

import { CreateAdminDto } from './create-admin.dto';

// La información para el login es la misma que para crear un admin,
// así que simplemente extendemos la clase para reutilizar las validaciones.
export class LoginDto extends CreateAdminDto {}