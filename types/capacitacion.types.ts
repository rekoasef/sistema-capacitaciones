import { z } from 'zod';
import { Database } from '@/types/supabase'; 

// ====================================================================
// 1. Tipos de ENUMS
// ====================================================================

export const ModalidadEnum = z.enum(['presencial', 'online', 'hibrido']);
export const EstadoCapacitacionEnum = z.enum(['visible', 'oculto', 'borrador']);

// ====================================================================
// 2. Tipos base de Supabase
// ====================================================================

// Extendemos manualmente el Row para incluir 'ubicacion' sin regenerar todo types/supabase.ts
export type CapacitacionRow = Database['public']['Tables']['capacitaciones']['Row'] & {
    ubicacion?: string | null;
};

// ====================================================================
// 3. Esquema Zod para Validación
// ====================================================================

export const CapacitacionFormSchema = z.object({
    id: z.coerce.number().optional(), 
    nombre: z.string().min(5, 'El nombre debe ser descriptivo (mínimo 5 caracteres).')
             .max(255, 'El nombre no debe exceder los 255 caracteres.'),
    descripcion: z.string().min(20, 'La descripción es obligatoria y debe ser detallada.')
                  .max(1000, 'La descripción es demasiado larga.'),
    
    modalidad: ModalidadEnum.default('online'),
    estado: EstadoCapacitacionEnum.default('borrador'),
    
    // NUEVO CAMPO: Ubicación
    ubicacion: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
    // Validación condicional: Si es Presencial o Híbrido, la ubicación es obligatoria
    if ((data.modalidad === 'presencial' || data.modalidad === 'hibrido') && (!data.ubicacion || data.ubicacion.length < 3)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La ubicación es obligatoria para cursos presenciales.",
            path: ["ubicacion"],
        });
    }
});

export type CapacitacionFormInputs = z.infer<typeof CapacitacionFormSchema>;