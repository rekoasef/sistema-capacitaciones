import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

// Tipos base (asume que los tipos de Supabase están generados)
type CapacitacionRow = Database['public']['Tables']['capacitaciones']['Row'];
type CapacitacionInsert = Database['public']['Tables']['capacitaciones']['Insert'];
type CapacitacionUpdate = Database['public']['Tables']['capacitaciones']['Update'];

// ====================================================================
// Servicio para interactuar con la tabla 'capacitaciones'
// ====================================================================

/**
 * Obtiene todas las capacitaciones (protegido por RLS).
 */
export async function getCapacitaciones(): Promise<CapacitacionRow[]> {
    const supabase = createClient();
    
    // El usuario SuperAdmin puede leer todos los registros.
    const { data, error } = await supabase
        .from('capacitaciones')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Error al obtener capacitaciones:', error.message);
        throw new Error('Fallo al cargar la lista de capacitaciones.');
    }

    return data as CapacitacionRow[];
}

/**
 * Crea una nueva capacitación.
 */
export async function createCapacitacion(data: CapacitacionInsert): Promise<CapacitacionRow> {
    const supabase = createClient();

    const { data: capacitacion, error } = await supabase
        .from('capacitaciones')
        .insert(data)
        .select()
        .single();
    
    if (error) {
        console.error('Error al crear capacitación:', error.message);
        throw new Error('Fallo al crear la capacitación. Inténtalo de nuevo.');
    }

    return capacitacion as CapacitacionRow;
}

/**
 * Actualiza una capacitación existente.
 */
export async function updateCapacitacion(id: number, data: CapacitacionUpdate): Promise<CapacitacionRow> {
    const supabase = createClient();

    const { data: capacitacion, error } = await supabase
        .from('capacitaciones')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error al actualizar capacitación:', error.message);
        throw new Error('Fallo al actualizar la capacitación.');
    }

    return capacitacion as CapacitacionRow;
}

/**
 * Elimina una capacitación.
 */
export async function deleteCapacitacion(id: number): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('capacitaciones')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error al eliminar capacitación:', error.message);
        if (error.code === '23503') { 
            throw new Error('No se puede eliminar. Esta capacitación tiene grupos o días asociados.');
        }
        throw new Error('Fallo al eliminar la capacitación.');
    }
}