import { createClient } from '@/lib/supabase/server';
import { MecanicoFormInputs, MecanicoRow } from '@/types/mecanico.types';

// ====================================================================
// Servicio para interactuar con la tabla 'mecanicos'
// ====================================================================

/**
 * Obtiene la lista COMPLETA de mecánicos (Para Admin).
 */
export async function getMecanicosByConcesionario(concesionarioId: number): Promise<MecanicoRow[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        // @ts-ignore: Ignoramos falta de tipado en tabla nueva
        .from('mecanicos')
        .select('*')
        .eq('concesionario_id', concesionarioId)
        .order('apellido', { ascending: true }) 
        .order('nombre', { ascending: true });

    if (error) {
        console.error('Error al obtener mecánicos:', error.message);
        throw new Error('No se pudo cargar la lista de mecánicos.');
    }

    return data as MecanicoRow[];
}

/**
 * Obtiene lista SIMPLIFICADA para el select público (NUEVO).
 */
export async function getMecanicosPublicos(concesionarioId: number) {
    const supabase = createClient();

    const { data, error } = await supabase
        // @ts-ignore
        .from('mecanicos')
        .select('id, nombre, apellido') // Solo lo necesario para el combo
        .eq('concesionario_id', concesionarioId)
        .order('apellido', { ascending: true });

    if (error) {
        console.error('Error al obtener mecánicos públicos:', error.message);
        return [];
    }

    return data;
}

/**
 * Crea un nuevo mecánico y devuelve su ID.
 */
export async function createMecanico(data: MecanicoFormInputs): Promise<number> {
    const supabase = createClient();

    // Modificamos para devolver el ID del nuevo mecánico (útil para la inscripción automática)
    const { data: nuevo, error } = await supabase
        // @ts-ignore
        .from('mecanicos')
        .insert({
            concesionario_id: data.concesionario_id,
            nombre: data.nombre,
            apellido: data.apellido,
            rol: data.rol,
            nivel: data.nivel
        })
        .select('id')
        .single();

    if (error || !nuevo) {
        console.error('Error al crear mecánico:', error?.message);
        throw new Error('Fallo al registrar el mecánico.');
    }

    // FIX: Casteamos explícitamente el resultado para que TS no se queje
    return (nuevo as unknown as { id: number }).id;
}

/**
 * Actualiza los datos de un mecánico existente.
 */
export async function updateMecanico(data: MecanicoFormInputs): Promise<void> {
    const supabase = createClient();

    if (!data.id) throw new Error('El ID del mecánico es requerido para actualizar.');

    const { error } = await supabase
        // @ts-ignore
        .from('mecanicos')
        .update({
            nombre: data.nombre,
            apellido: data.apellido,
            rol: data.rol,
            nivel: data.nivel
        })
        .eq('id', data.id);

    if (error) {
        console.error('Error al actualizar mecánico:', error.message);
        throw new Error('Fallo al actualizar los datos del mecánico.');
    }
}

/**
 * Elimina un mecánico.
 */
export async function deleteMecanico(id: number): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        // @ts-ignore
        .from('mecanicos')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error al eliminar mecánico:', error.message);
        throw new Error('No se pudo eliminar al mecánico.');
    }
}