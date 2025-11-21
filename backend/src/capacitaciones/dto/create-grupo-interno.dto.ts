// backend/src/capacitaciones/dto/create-grupo-interno.dto.ts
import { IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGrupoSegmentoDto } from '../../grupos/dto/create-grupo-segmento.dto';

export class CreateGrupoInternoDto {
  
  @IsInt()
  @Min(1)
  cupoMaximo: number;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGrupoSegmentoDto)
  segmentos: CreateGrupoSegmentoDto[];
}