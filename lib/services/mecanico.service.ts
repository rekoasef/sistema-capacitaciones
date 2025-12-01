import { createClient } from '@/lib/supabase/server';
import { MecanicoFormInputs, MecanicoRow } from '@/types/mecanico.types';

// ====================================================================
// Servicio para interactuar con la tabla 'mecanicos'
// ====================================================================

/**
 * Obtiene la lista de mecánicos de un concesionario específico.
 */
export async function getMecanicosByConcesionario(concesionarioId: number): Promise<MecanicoRow[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('mecanicos')
        .select('*')
        .eq('concesionario_id', concesionarioId)
        .order('apellido', { ascending: true }) // Orden alfabético por apellido
        .order('nombre', { ascending: true });

    if (error) {
        console.error('Error al obtener mecánicos:', error.message);
        throw new Error('No se pudo cargar la lista de mecánicos.');
    }

    return data as MecanicoRow[];
}

/**
 * Crea un nuevo mecánico.
 */
export async function createMecanico(data: MecanicoFormInputs): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('mecanicos')
        .insert({
            concesionario_id: data.concesionario_id,
            nombre: data.nombre,
            apellido: data.apellido,
            rol: data.rol,
            nivel: data.nivel
        });

    if (error) {
        console.error('Error al crear mecánico:', error.message);
        throw new Error('Fallo al registrar el mecánico.');
    }
}

/**
 * Actualiza los datos de un mecánico existente.
 */
export async function updateMecanico(data: MecanicoFormInputs): Promise<void> {
    const supabase = createClient();

    if (!data.id) throw new Error('El ID del mecánico es requerido para actualizar.');

    const { error } = await supabase
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
        .from('mecanicos')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error al eliminar mecánico:', error.message);
        throw new Error('No se pudo eliminar al mecánico.');
    }
}