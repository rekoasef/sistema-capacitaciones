// backend/src/capacitaciones/dto/create-capacitacion.dto.ts
import { IsString, IsNotEmpty, IsBoolean, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGrupoInternoDto } from './create-grupo-interno.dto';

export class CreateCapacitacionDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    descripcion: string;

    @IsString()
    instructor: string;

    @IsEnum(['Presencial', 'Online'], { message: 'La modalidad debe ser Presencial u Online.' })
    modalidad: 'Presencial' | 'Online';

    @IsString()
    @IsOptional()
    ubicacion: string;

    @IsBoolean()
    @IsOptional()
    visible: boolean;
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateGrupoInternoDto)
    grupos: CreateGrupoInternoDto[];
}