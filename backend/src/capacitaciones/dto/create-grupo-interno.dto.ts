// src/capacitaciones/dto/create-grupo-interno.dto.ts
import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateGrupoInternoDto {
  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsInt()
  @Min(1)
  cupoMaximo: number;
}