// src/inscripciones/dto/create-inscripcion.dto.ts

import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInscripcionDto {
  @IsString()
  @IsNotEmpty()
  nombreUsuario: string;

  @IsEmail()
  emailUsuario: string;

  @IsInt()
  grupoId: number;

  @IsInt()
  concesionarioId: number; 

  @IsString()
  @IsOptional()
  telefono?: string; 

  @IsString()
  @IsOptional()
  informacionAdicional?: string;
}