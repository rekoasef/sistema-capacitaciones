// backend/src/capacitaciones/dto/update-capacitacion.dto.ts
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCapacitacionDto } from './create-capacitacion.dto';

// Usamos PartialType para hacer todos los campos opcionales (incluyendo 'visible').
// Usamos OmitType para EXCLUIR el array 'grupos'.
export class UpdateCapacitacionDto extends PartialType(
  OmitType(CreateCapacitacionDto, ['grupos'] as const),
) {}