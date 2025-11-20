// backend/src/capacitaciones/dto/create-capacitacion.dto.ts

import { IsArray, IsOptional, ValidateNested, IsBoolean } from 'class-validator'; // <-- 1. Importar IsBoolean
import { Type } from 'class-transformer';
import { CreateGrupoInternoDto } from './create-grupo-interno.dto';

export class CreateCapacitacionDto {
  nombre: string;
  descripcion: string;
  instructor: string;
  modalidad: string;

  // --- ¡NUEVO CAMPO! ---
  @IsBoolean()
  @IsOptional() // Es opcional, porque en la creación asumimos 'true' por defecto
  visible?: boolean;
  ubicacion: string;

  // ¡LÓGICA EXISTENTE!
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateGrupoInternoDto)
  grupos: CreateGrupoInternoDto[];
}