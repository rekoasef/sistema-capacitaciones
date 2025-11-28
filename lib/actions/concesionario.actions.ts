'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
    createConcesionario, 
    updateConcesionario, 
    deleteConcesionario 
} from '@/lib/services/concesionario.service';
import { isSuperAdmin } from '@/lib/utils/auth.utils'; // Importado con ruta relativa

// --------------------------------------------------------------------
// Esquema de Validación Zod (Garantía de tipado y Backend)
// --------------------------------------------------------------------

const ConcesionarioSchema = z.object({
    id: z.coerce.number().optional(), // ID es opcional para la creación
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.')
             .max(100, 'El nombre no debe exceder los 100 caracteres.'),
});

// --------------------------------------------------------------------
// ACCIONES DE MUTACIÓN
// --------------------------------------------------------------------

/**
 * Maneja la creación de un nuevo concesionario.
 */
export async function createConcesionarioAction(prevState: any, formData: FormData) {
    // 1. Autorización (CRÍTICO: Verificación de SuperAdmin)
    if (!(await isSuperAdmin())) {
        return { message: 'Error: No autorizado. Solo SuperAdmin puede crear concesionarios.' };
    }
    
    // 2. Validación de Inputs (Backend)
    const validatedFields = ConcesionarioSchema.safeParse({
        nombre: formData.get('nombre'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos inválidos. Verifica el nombre.',
        };
    }
    
    // 3. Lógica de Negocio y Persistencia
    try {
        await createConcesionario({ nombre: validatedFields.data.nombre });
        revalidatePath('/admin/concesionarios'); // Actualiza la lista en el frontend
        return { success: true, message: 'Concesionario creado con éxito.' };
    } catch (error) {
        // Captura errores del servicio (ej: nombre duplicado)
        return { success: false, message: (error as Error).message };
    }
}

/**
 * Maneja la actualización de un concesionario existente.
 */
export async function updateConcesionarioAction(prevState: any, formData: FormData) {
    // 1. Autorización
    if (!(await isSuperAdmin())) {
        return { message: 'Error: No autorizado. Solo SuperAdmin puede editar concesionarios.' };
    }

    // 2. Validación de Inputs
    const validatedFields = ConcesionarioSchema.safeParse({
        id: formData.get('id'),
        nombre: formData.get('nombre'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos inválidos. Verifica el nombre y el ID.',
        };
    }

    const { id, nombre } = validatedFields.data;
    if (!id) {
        return { message: 'Error: ID del concesionario es requerido para actualizar.' };
    }

    // 3. Lógica de Negocio y Persistencia
    try {
        await updateConcesionario(id, { nombre });
        revalidatePath('/admin/concesionarios');
        return { success: true, message: 'Concesionario actualizado con éxito.' };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

/**
 * Maneja la eliminación de un concesionario.
 */
export async function deleteConcesionarioAction(id: number) {
    // 1. Autorización
    if (!(await isSuperAdmin())) {
        // Usamos un objeto simple de error en lugar de throw para manejarlo en la UI
        return { success: false, message: 'Error: No autorizado. Solo SuperAdmin puede eliminar concesionarios.' };
    }
    
    // 2. Lógica de Negocio y Persistencia
    try {
        await deleteConcesionario(id);
        revalidatePath('/admin/concesionarios');
        return { success: true, message: 'Concesionario eliminado con éxito.' };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}