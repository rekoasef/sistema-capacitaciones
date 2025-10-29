// src/capacitaciones/dto/create-capacitacion.dto.ts

import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGrupoInternoDto } from './create-grupo-interno.dto';

export class CreateCapacitacionDto {
  nombre: string;
  descripcion: string;
  instructor: string;
  modalidad: string;

  // ¡NUEVA LÓGICA!
  @IsArray()
  @IsOptional() // Los grupos son opcionales
  @ValidateNested({ each: true }) // Valida cada objeto del array
  @Type(() => CreateGrupoInternoDto) // Especifica el tipo de cada objeto
  grupos: CreateGrupoInternoDto[];
}