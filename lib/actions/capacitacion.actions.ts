'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
    createCapacitacion, 
    updateCapacitacion, 
    deleteCapacitacion,
    getCapacitaciones 
} from '@/lib/services/capacitacion.service'; // Correcto (1 nivel)
import { isSuperAdmin } from '@/lib/utils/auth.utils'; 
import { 
    CapacitacionFormSchema, // Ya no necesita cupo_maximo
    CapacitacionFormInputs,
    CapacitacionRow 
} from '@/types/capacitacion.types'; // FIX CRÍTICO: Debería ser 1 nivel (../types/...)

// --------------------------------------------------------------------
// Esquema de Validación Zod (Definición local para Server Actions)
// FIX: Eliminamos la lógica de cupo_maximo de este esquema
// --------------------------------------------------------------------

const ModalidadEnum = z.enum(['presencial', 'online', 'hibrido']);
const EstadoCapacitacionEnum = z.enum(['visible', 'oculto', 'borrador']);

const LocalCapacitacionSchema = z.object({
    id: z.coerce.number().optional(), 
    nombre: z.string().min(5, 'El nombre debe ser descriptivo (mínimo 5 caracteres).')
             .max(255, 'El nombre no debe exceder los 255 caracteres.'),
    descripcion: z.string().min(20, 'La descripción es obligatoria y debe ser detallada.')
                  .max(1000, 'La descripción es demasiado larga.'),
    modalidad: ModalidadEnum.default('online'),
    estado: EstadoCapacitacionEnum.default('borrador'),
    // cupo_maximo ELIMINADO
});


// --------------------------------------------------------------------
// ACCIÓN DE LECTURA (GET)
// --------------------------------------------------------------------

/**
 * Obtiene todas las capacitaciones y maneja el retorno estructurado para el Server Component.
 */
export async function getCapacitacionesAction(): Promise<{ success: true, data: CapacitacionRow[] } | { success: false, message: string }> {
    'use server';

    if (!(await isSuperAdmin())) {
        return { success: false, message: 'Fallo de autorización al obtener datos.' };
    }

    try {
        const data = await getCapacitaciones(); // Llama al servicio que aplica RLS
        return { success: true, data };
    } catch (error) {
        return { success: false, message: (error as Error).message || 'Fallo al obtener la lista de capacitaciones.' };
    }
}

// --------------------------------------------------------------------
// ACCIONES DE MUTACIÓN (FIXED: ELIMINAR CAMPO cupo_maximo)
// --------------------------------------------------------------------

/**
 * Maneja la creación de una nueva capacitación.
 */
export async function createCapacitacionAction(prevState: any, formData: FormData) {
    'use server'; 
    
    if (!(await isSuperAdmin())) {
        return { message: 'Error: No autorizado. Solo SuperAdmin puede crear capacitaciones.' };
    }
    
    const validatedFields = LocalCapacitacionSchema.safeParse({
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        modalidad: formData.get('modalidad'),
        estado: formData.get('estado'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos inválidos. Verifica todos los datos.',
        };
    }
    
    const data: Omit<CapacitacionFormInputs, 'id'> = validatedFields.data;

    try {
        await createCapacitacion(data); 
        revalidatePath('/admin/capacitaciones'); 
        return { success: true, message: 'Capacitación creada con éxito.' };
    } catch (error) {
        return { success: false, message: (error as Error).message || 'Error desconocido en la BD.' };
    }
}

/**
 * Maneja la actualización de una capacitación existente.
 */
export async function updateCapacitacionAction(prevState: any, formData: FormData) {
    'use server'; 
    
    if (!(await isSuperAdmin())) {
        return { message: 'Error: No autorizado. Solo SuperAdmin puede editar capacitaciones.' };
    }

    const validatedFields = LocalCapacitacionSchema.safeParse({
        id: formData.get('id'), 
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        modalidad: formData.get('modalidad'),
        estado: formData.get('estado'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos inválidos. Verifica todos los datos.',
        };
    }

    const { id, ...updateData } = validatedFields.data;
    if (!id) {
        return { message: 'Error: ID de la capacitación es requerido para actualizar.' };
    }

    try {
        await updateCapacitacion(id, updateData);
        revalidatePath('/admin/capacitaciones');
        return { success: true, message: 'Capacitación actualizada con éxito.' };
    } catch (error) {
        return { success: false, message: (error as Error).message || 'Error desconocido en la BD.' };
    }
}

/**
 * Maneja la eliminación de una capacitación.
 */
export async function deleteCapacitacionAction(id: number) {
    'use server'; 

    if (!(await isSuperAdmin())) {
        return { success: false, message: 'Error: No autorizado. Solo SuperAdmin puede eliminar capacitaciones.' };
    }
    
    try {
        await deleteCapacitacion(id);
        revalidatePath('/admin/capacitaciones');
        return { success: true, message: 'Capacitación eliminada con éxito.' };
    } catch (error) {
        return { success: false, message: (error as Error).message || 'Error desconocido en la BD.' };
    }
}