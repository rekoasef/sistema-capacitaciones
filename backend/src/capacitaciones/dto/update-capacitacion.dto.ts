// backend/src/capacitaciones/dto/update-capacitacion.dto.ts
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCapacitacionDto } from './create-capacitacion.dto';

// Usamos PartialType para hacer todos los campos opcionales.
// Usamos OmitType para EXCLUIR el array 'grupos'.
// La gestión de grupos (crear, borrar, editar) se hará a través
// de los endpoints de /grupos, no del endpoint de /capacitaciones/:id
export class UpdateCapacitacionDto extends PartialType(
  OmitType(CreateCapacitacionDto, ['grupos'] as const),
) {}