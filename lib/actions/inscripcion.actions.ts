'use server';

import { revalidatePath } from 'next/cache';
import { isSuperAdmin } from '@/lib/utils/auth.utils';
// Importamos las nuevas funciones del servicio
import { createInscripcion, deleteInscripcion, toggleAsistencia } from '@/lib/services/inscripcion.service';
import { InscripcionFormSchema, InscripcionFormInputs } from '@/types/inscripcion.types';

// ====================================================================
// ACCIÓN DE MUTACIÓN PÚBLICA (INSCRIPCIÓN)
// ====================================================================

/**
 * Procesa el formulario de inscripción enviado por el usuario.
 */
export async function createInscripcionAction(data: InscripcionFormInputs) {
    // 1. Validación de Inputs
    const validation = InscripcionFormSchema.safeParse(data);

    if (!validation.success) {
        return {
            success: false,
            message: 'Datos incompletos o inválidos. Por favor revisa el formulario.',
            errors: validation.error.flatten().fieldErrors
        };
    }

    // 2. Ejecución de la Lógica de Negocio
    try {
        await createInscripcion(validation.data);

        // Revalidamos rutas públicas para actualizar cupos
        revalidatePath('/'); 
        revalidatePath('/capacitacion/[id]', 'page'); 
        // También revalidamos el panel admin por si el admin lo está viendo en vivo
        revalidatePath('/admin/inscripciones');
        revalidatePath('/admin/dashboard');

        return { 
            success: true, 
            message: '¡Tu inscripción ha sido confirmada con éxito! Te esperamos.' 
        };

    } catch (error) {
        const errorMsg = (error as Error).message;
        return { 
            success: false, 
            message: errorMsg || 'Ocurrió un error técnico al procesar tu inscripción.' 
        };
    }
}

// ====================================================================
// ACCIONES ADMINISTRATIVAS (GESTIÓN)
// ====================================================================

/**
 * Elimina una inscripción (Dar de baja).
 * Solo SuperAdmin.
 */
export async function deleteInscripcionAction(id: string) {
    // 1. Seguridad
    if (!(await isSuperAdmin())) {
        return { success: false, message: 'No autorizado.' };
    }

    // 2. Ejecución
    try {
        await deleteInscripcion(id);
        
        // Revalidamos todo lo necesario para liberar el cupo visualmente
        revalidatePath('/admin/inscripciones');
        revalidatePath('/admin/dashboard');
        revalidatePath('/'); // Importante: Libera cupo en el público también
        
        return { success: true, message: 'Inscripción eliminada correctamente.' };
    } catch (error) {
        return { success: false, message: (error as Error).message || 'Error al eliminar.' };
    }
}

/**
 * Marca o desmarca la asistencia de un alumno.
 * Solo SuperAdmin.
 */
export async function toggleAsistenciaAction(id: string, asistio: boolean) {
    // 1. Seguridad
    if (!(await isSuperAdmin())) {
        return { success: false, message: 'No autorizado.' };
    }

    // 2. Ejecución
    try {
        await toggleAsistencia(id, asistio);
        revalidatePath('/admin/inscripciones');
        revalidatePath('/admin/dashboard');
        return { success: true, message: 'Asistencia actualizada.' };
    } catch (error) {
        return { success: false, message: 'Error al actualizar asistencia.' };
    }
}