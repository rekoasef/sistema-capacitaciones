'use server';

import { revalidatePath } from 'next/cache';
import { isSuperAdmin } from '@/lib/utils/auth.utils';
import { createMecanico, updateMecanico, deleteMecanico, getMecanicosPublicos } from '@/lib/services/mecanico.service';
import { MecanicoFormSchema, MecanicoFormInputs } from '@/types/mecanico.types';

// ====================================================================
// ACCIONES DE LECTURA (PARA EL FORMULARIO PÚBLICO)
// ====================================================================

/**
 * Obtiene mecánicos de un concesionario para llenar el select.
 * Retorna un objeto tipado para que el Frontend no de error.
 */
export async function getMecanicosAction(concesionarioId: number) {
    try {
        const data = await getMecanicosPublicos(concesionarioId);
        return { success: true, data };
    } catch (error) {
        console.error("Error en getMecanicosAction:", error);
        return { success: false, data: [] };
    }
}

// ====================================================================
// ACCIONES DE MUTACIÓN (ADMINISTRATIVAS)
// ====================================================================

export async function createMecanicoAction(data: MecanicoFormInputs) {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) return { success: false, message: 'Acceso denegado.' };

    const validation = MecanicoFormSchema.safeParse(data);
    if (!validation.success) return { success: false, message: 'Datos inválidos.', errors: validation.error.flatten().fieldErrors };

    try {
        await createMecanico(validation.data);
        revalidatePath(`/admin/concesionarios/${validation.data.concesionario_id}`);
        return { success: true, message: 'Mecánico registrado.' };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function updateMecanicoAction(data: MecanicoFormInputs) {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) return { success: false, message: 'Acceso denegado.' };
    if (!data.id) return { success: false, message: 'Falta ID.' };

    const validation = MecanicoFormSchema.safeParse(data);
    if (!validation.success) return { success: false, message: 'Datos inválidos.' };

    try {
        await updateMecanico(validation.data);
        revalidatePath(`/admin/concesionarios/${validation.data.concesionario_id}`);
        return { success: true, message: 'Actualizado.' };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteMecanicoAction(id: number, concesionarioId: number) {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) return { success: false, message: 'No autorizado.' };

    try {
        await deleteMecanico(id);
        revalidatePath(`/admin/concesionarios/${concesionarioId}`);
        return { success: true, message: 'Eliminado.' };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
}