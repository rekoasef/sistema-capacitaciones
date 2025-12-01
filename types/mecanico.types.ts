import { z } from 'zod';

// ====================================================================
// 1. Enums y Tipos Base
// ====================================================================

// Niveles permitidos (Coincide con el ENUM de Postgres)
export const NivelMecanicoEnum = z.enum(['Junior', 'Basico', 'Avanzado']);

// Tipo de la fila en BD (Definición manual para evitar dependencia de regenerar tipos ahora)
export interface MecanicoRow {
  id: number;
  created_at?: string;
  concesionario_id: number;
  nombre: string;
  apellido: string;
  rol: string | null; // Puede ser null en BD, aunque por defecto es 'Mecánico'
  nivel: 'Junior' | 'Basico' | 'Avanzado';
}

// ====================================================================
// 2. Esquemas de Validación Zod (Formulario)
// ====================================================================

export const MecanicoFormSchema = z.object({
  id: z.coerce.number().optional(), // Opcional para crear
  concesionario_id: z.coerce.number(), // ID del concesionario padre
  
  nombre: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(50, "El nombre es demasiado largo."),
    
  apellido: z.string()
    .min(2, "El apellido debe tener al menos 2 caracteres.")
    .max(50, "El apellido es demasiado largo."),
  
  rol: z.string().default('Mecánico'), // Por defecto
  
  nivel: NivelMecanicoEnum.default('Junior'), // Por defecto Junior
});

// ====================================================================
// 3. Tipos Inferidos
// ====================================================================

export type MecanicoFormInputs = z.infer<typeof MecanicoFormSchema>;