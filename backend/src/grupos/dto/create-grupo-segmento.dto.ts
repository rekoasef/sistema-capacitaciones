// backend/src/grupos/dto/create-grupo-segmento.dto.ts

import { IsDateString, IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateGrupoSegmentoDto {
  // El día se envía como una fecha ISO (solo la parte de la fecha)
  @IsDateString()
  dia: string;

  // La hora de inicio (ej: "09:00")
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'La hora de inicio debe estar en formato HH:MM (24h).' })
  horaInicio: string;

  // La hora de fin (ej: "16:00")
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'La hora de fin debe estar en formato HH:MM (24h).' })
  horaFin: string;
}