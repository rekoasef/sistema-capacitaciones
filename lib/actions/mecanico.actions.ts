'use server';

import { revalidatePath } from 'next/cache';
import { isSuperAdmin } from '@/lib/utils/auth.utils';
import { createMecanico, updateMecanico, deleteMecanico } from '@/lib/services/mecanico.service';
import { MecanicoFormSchema, MecanicoFormInputs } from '@/types/mecanico.types';

// ====================================================================
// ACCIONES DE MUTACIÓN PARA MECÁNICOS
// ====================================================================

/**
 * Crea un nuevo mecánico asociado a un concesionario.
 */
export async function createMecanicoAction(data: MecanicoFormInputs) {
    // 1. Verificación de Seguridad (RBAC)
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
        return { success: false, message: 'Acceso denegado. Se requieren permisos de SuperAdmin.' };
    }

    // 2. Validación de Datos (Backend)
    const validation = MecanicoFormSchema.safeParse(data);

    if (!validation.success) {
        return {
            success: false,
            message: 'Datos inválidos. Por favor revisa los campos.',
            errors: validation.error.flatten().fieldErrors
        };
    }

    // 3. Ejecución de la Lógica de Negocio
    try {
        await createMecanico(validation.data);
        
        // Revalidar la página de detalles del concesionario para mostrar el nuevo mecánico
        revalidatePath(`/admin/concesionarios/${validation.data.concesionario_id}`);
        
        return { success: true, message: 'Mecánico registrado exitosamente.' };
    } catch (error) {
        return { success: false, message: (error as Error).message || 'Error interno al registrar el mecánico.' };
    }
}

/**
 * Actualiza los datos de un mecánico existente.
 */
export async function updateMecanicoAction(data: MecanicoFormInputs) {
    // 1. Verificación de Seguridad
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
        return { success: false, message: 'Acceso denegado. Se requieren permisos de SuperAdmin.' };
    }

    // Chequeo de integridad
    if (!data.id) {
        return { success: false, message: 'Error de integridad: Falta el ID del mecánico.' };
    }

    // 2. Validación de Datos
    const validation = MecanicoFormSchema.safeParse(data);

    if (!validation.success) {
        return {
            success: false,
            message: 'Datos inválidos al actualizar.',
            errors: validation.error.flatten().fieldErrors
        };
    }

    // 3. Ejecución
    try {
        await updateMecanico(validation.data);
        
        // Revalidar la página del concesionario
        revalidatePath(`/admin/concesionarios/${validation.data.concesionario_id}`);
        
        return { success: true, message: 'Datos del mecánico actualizados correctamente.' };
    } catch (error) {
        return { success: false, message: (error as Error).message || 'Error interno al actualizar el mecánico.' };
    }
}

/**
 * Elimina un mecánico.
 * Requiere el ID del mecánico y el ID del concesionario para revalidar la ruta correcta.
 */
export async function deleteMecanicoAction(id: number, concesionarioId: number) {
    // 1. Verificación de Seguridad
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
        return { success: false, message: 'No tienes permisos para eliminar mecánicos.' };
    }

    // 2. Ejecución
    try {
        await deleteMecanico(id);
        
        // Revalidar para que desaparezca de la lista
        revalidatePath(`/admin/concesionarios/${concesionarioId}`);
        
        return { success: true, message: 'Mecánico eliminado correctamente.' };
    } catch (error) {
        return { success: false, message: (error as Error).message || 'No se pudo eliminar al mecánico.' };
    }
}