'use server';

import { revalidatePath } from 'next/cache';
import { isSuperAdmin } from '@/lib/utils/auth.utils';
// Importamos updateGrupo que acabamos de crear en el servicio
import { createGrupo, updateGrupo, deleteGrupo } from '@/lib/services/grupo.service';
import { GrupoFormSchema, GrupoFormInputs } from '@/types/grupo.types';

// ====================================================================
// ACCIONES DE MUTACIÓN PARA GRUPOS
// ====================================================================

/**
 * Crea un nuevo grupo con sus días asociados.
 */
export async function createGrupoAction(data: GrupoFormInputs) {
    // 1. Verificación de Seguridad
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
        return { success: false, message: 'Acceso denegado. Se requieren permisos de SuperAdmin.' };
    }

    // 2. Validación de Datos
    const validation = GrupoFormSchema.safeParse(data);

    if (!validation.success) {
        return {
            success: false,
            message: 'Datos inválidos. Por favor revisa los campos.',
            errors: validation.error.flatten().fieldErrors
        };
    }

    // 3. Ejecución
    try {
        await createGrupo(validation.data);
        
        // Revalidar la página de detalles para mostrar el nuevo grupo
        revalidatePath(`/admin/capacitaciones/${validation.data.capacitacion_id}`);
        
        return { success: true, message: 'Grupo creado exitosamente.' };
    } catch (error) {
        return { success: false, message: (error as Error).message || 'Error interno al crear el grupo.' };
    }
}

/**
 * Actualiza un grupo existente y gestiona sus días (Smart Update).
 */
export async function updateGrupoAction(data: GrupoFormInputs) {
    // 1. Verificación de Seguridad
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
        return { success: false, message: 'Acceso denegado. Se requieren permisos de SuperAdmin.' };
    }

    // Validar que venga el ID, esencial para update
    if (!data.id) {
        return { success: false, message: 'Error de integridad: Falta el ID del grupo.' };
    }

    // 2. Validación de Datos
    const validation = GrupoFormSchema.safeParse(data);

    if (!validation.success) {
        return {
            success: false,
            message: 'Datos inválidos al actualizar.',
            errors: validation.error.flatten().fieldErrors
        };
    }

    // 3. Ejecución
    try {
        await updateGrupo(validation.data);
        
        // Revalidar para reflejar cambios en cupos, nombres o cronograma
        revalidatePath(`/admin/capacitaciones/${validation.data.capacitacion_id}`);
        
        return { success: true, message: 'Grupo actualizado correctamente.' };
    } catch (error) {
        return { success: false, message: (error as Error).message || 'Error interno al actualizar el grupo.' };
    }
}

/**
 * Elimina un grupo existente.
 */
export async function deleteGrupoAction(id: number, capacitacionId: number) {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
        return { success: false, message: 'No tienes permisos para eliminar grupos.' };
    }

    try {
        await deleteGrupo(id);
        revalidatePath(`/admin/capacitaciones/${capacitacionId}`);
        return { success: true, message: 'Grupo eliminado correctamente.' };
    } catch (error) {
        return { success: false, message: (error as Error).message || 'No se pudo eliminar el grupo.' };
    }
}