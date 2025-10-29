// backend/src/grupos/dto/update-grupo.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateGrupoDto } from './create-grupo.dto';

// PartialType toma todos los campos de CreateGrupoDto y los hace opcionales.
export class UpdateGrupoDto extends PartialType(CreateGrupoDto) {}