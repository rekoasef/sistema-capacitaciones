import { z } from 'zod';
import { Database } from '@/types/supabase';

// ====================================================================
// 1. Enums y Tipos Base (Tipos de BD)
// ====================================================================

// Enum para el estado del grupo (coincide con la BD)
export const EstadoGrupoEnum = z.enum(['activo', 'inactivo', 'cerrado', 'lleno']);

// Tipos derivados directamente de la definición de Supabase
export type GrupoRow = Database['public']['Tables']['grupos']['Row'];
export type DiaGrupoRow = Database['public']['Tables']['dias_grupo']['Row'];

// Tipo compuesto para la vista (Un Grupo que incluye sus Días anidados)
// Útil para cuando hacemos el select con join en el servicio
export interface GrupoWithDias extends GrupoRow {
  dias: DiaGrupoRow[];
}

// ====================================================================
// 2. Esquemas de Validación Zod (Para Formularios y Server Actions)
// ====================================================================

// Schema para un solo día de cursado
export const DiaCursadoSchema = z.object({
  id: z.coerce.number().optional(), // Opcional: undefined si es nuevo, número si ya existe en BD
  
  // Validación de fecha: debe ser un string parseable a fecha
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida (formato esperado YYYY-MM-DD)",
  }),
  
  // Validación de hora: Regex simple para HH:MM
  hora_inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido (HH:MM)"),
  hora_fin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido (HH:MM)"),
}).refine((data) => {
  // Validación cruzada lógica: Hora fin debe ser posterior a Hora inicio
  if (!data.hora_inicio || !data.hora_fin) return true; // Si faltan datos, dejan pasar (validación individual atrapa)
  return data.hora_fin > data.hora_inicio;
}, {
  message: "La hora de finalización debe ser posterior a la de inicio.",
  path: ["hora_fin"], // El error se asocia al campo 'hora_fin'
});

// Schema Principal para el Grupo completo (Maestro + Detalle)
export const GrupoFormSchema = z.object({
  id: z.coerce.number().optional(), // ID del grupo (opcional en creación)
  capacitacion_id: z.coerce.number(), // ID de la capacitación padre (obligatorio)
  
  nombre_grupo: z.string().min(1, "El nombre del grupo es obligatorio (ej: Grupo A)."),
  cupo_maximo: z.coerce.number().min(1, "El cupo debe ser al menos 1."),
  
  estado: EstadoGrupoEnum.default('activo'),
  
  // Array de días: Se exige al menos un día para que el grupo tenga sentido
  dias: z.array(DiaCursadoSchema).min(1, "Debes agregar al menos un día de cursado."),
});

// ====================================================================
// 3. Tipos Inferidos (Para usar en React Hook Form y Props)
// ====================================================================

export type GrupoFormInputs = z.infer<typeof GrupoFormSchema>;
export type DiaCursadoInputs = z.infer<typeof DiaCursadoSchema>;