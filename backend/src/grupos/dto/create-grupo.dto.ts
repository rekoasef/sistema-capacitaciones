// src/grupos/dto/create-grupo.dto.ts

import { IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
// Importamos el nuevo DTO de segmento
import { CreateGrupoSegmentoDto } from './create-grupo-segmento.dto';

export class CreateGrupoDto {
  // TAREA 9.2: ELIMINADOS: fechaInicio y fechaFin

  @IsInt() // Asegura que sea un número entero
  @Min(1) // Asegura que el cupo sea como mínimo 1
  cupoMaximo: number;

  @IsInt() // Asegura que sea un número entero
  capacitacionId: number; // El ID de la capacitación a la que pertenece
  
  // TAREA 9.2: Nuevo campo para crear los segmentos junto con el grupo
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGrupoSegmentoDto)
  segmentos: CreateGrupoSegmentoDto[];
}