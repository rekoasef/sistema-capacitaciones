// backend/src/concesionarios/dto/create-concesionario.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConcesionarioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}