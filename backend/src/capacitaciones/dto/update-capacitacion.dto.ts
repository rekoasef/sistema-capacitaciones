// backend/src/capacitaciones/dto/update-capacitacion.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateCapacitacionDto } from './create-capacitacion.dto';

// CORRECCIÓN: Usamos PartialType de CreateCapacitacionDto directamente.
// Esto hace que todos los campos de CreateCapacitacionDto (incluyendo 'grupos') 
// sean opcionales, permitiendo la desestructuración segura en el service.
export class UpdateCapacitacionDto extends PartialType(CreateCapacitacionDto) {}