// backend/src/inscripciones/dto/update-inscripcion.dto.ts

import { IsOptional, IsString } from 'class-validator';

export class UpdateInscripcionDto {
  @IsString()
  @IsOptional()
  estado?: string;
}