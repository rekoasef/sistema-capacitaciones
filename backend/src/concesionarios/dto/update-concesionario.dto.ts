// backend/src/concesionarios/dto/update-concesionario.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateConcesionarioDto } from './create-concesionario.dto';

// PartialType hace que todos los campos de CreateConcesionarioDto sean opcionales
export class UpdateConcesionarioDto extends PartialType(CreateConcesionarioDto) {}