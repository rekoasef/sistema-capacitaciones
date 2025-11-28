import { z } from 'zod';
import { Database } from '@/types/supabase'; // Ruta relativa

// ====================================================================
// 1. Tipos de ENUMS (Debe coincidir con Supabase)
// ====================================================================

export const ModalidadEnum = z.enum(['presencial', 'online', 'hibrido']);
export const EstadoCapacitacionEnum = z.enum(['visible', 'oculto', 'borrador']);

// ====================================================================
// 2. Tipos base de Supabase (Generados)
// ====================================================================

export type CapacitacionRow = Database['public']['Tables']['capacitaciones']['Row'];

// ====================================================================
// 3. Esquema Zod para Validación de Formulario (Frontend y Server Action)
//    FIX: Se elimina 'cupo_maximo' de este esquema.
// ====================================================================

export const CapacitacionFormSchema = z.object({
    // Campos requeridos por el formulario
    id: z.coerce.number().optional(), 
    nombre: z.string().min(5, 'El nombre debe ser descriptivo (mínimo 5 caracteres).')
             .max(255, 'El nombre no debe exceder los 255 caracteres.'),
    descripcion: z.string().min(20, 'La descripción es obligatoria y debe ser detallada.')
                  .max(1000, 'La descripción es demasiado larga.'),
    
    modalidad: ModalidadEnum.default('online'),
    estado: EstadoCapacitacionEnum.default('borrador'),
    
    // cupo_maximo se moverá a un esquema de Grupo separado.
});

// Tipo final para usar en React Hook Form
export type CapacitacionFormInputs = z.infer<typeof CapacitacionFormSchema>;