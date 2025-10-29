// src/grupos/dto/create-grupo.dto.ts

import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateGrupoDto {
  @IsDateString()
  fechaInicio: string; // Esperamos una fecha en formato string (ej: "2025-12-31T18:00:00Z")

  @IsDateString()
  fechaFin: string;

  @IsInt() // Asegura que sea un número entero
  @Min(1) // Asegura que el cupo sea como mínimo 1
  cupoMaximo: number;

  @IsInt() // Asegura que sea un número entero
  capacitacionId: number; // El ID de la capacitación a la que pertenece
}