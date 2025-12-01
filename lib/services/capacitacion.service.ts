import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

// Tipos base
type CapacitacionRow = Database['public']['Tables']['capacitaciones']['Row'];
type CapacitacionInsert = Database['public']['Tables']['capacitaciones']['Insert'];
type CapacitacionUpdate = Database['public']['Tables']['capacitaciones']['Update'];

// ====================================================================
// Servicio para interactuar con la tabla 'capacitaciones'
// ====================================================================

/**
 * Obtiene todas las capacitaciones (ADMIN).
 * Protegido por RLS (solo SuperAdmin ve todo).
 */
export async function getCapacitaciones(): Promise<CapacitacionRow[]> {
    const supabase = createClient();
    
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
 * Obtiene SOLO las capacitaciones visibles para el PORTAL PÚBLICO.
 */
export async function getCapacitacionesPublicas(): Promise<CapacitacionRow[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('capacitaciones')
        .select('*')
        .eq('estado', 'visible')
        .order('id', { ascending: false });

    if (error) {
        // Fail-safe: si falla, devolvemos lista vacía en lugar de romper la home
        console.error('Error al obtener capacitaciones públicas:', error.message);
        return []; 
    }

    return data as CapacitacionRow[];
}

/**
 * Obtiene una capacitación por su ID (ADMIN).
 * Sin filtros de estado, para que el admin pueda editar borradores.
 */
export async function getCapacitacionById(id: number): Promise<CapacitacionRow | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('capacitaciones')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error al obtener capacitación ${id}:`, error.message);
        return null;
    }

    return data as CapacitacionRow;
}

/**
 * Obtiene una capacitación por su ID (PÚBLICO).
 * Aplica filtro de seguridad: solo devuelve si el estado es 'visible'.
 */
export async function getCapacitacionPublicaById(id: number): Promise<CapacitacionRow | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('capacitaciones')
        .select('*')
        .eq('id', id)
        .eq('estado', 'visible') // CANDADO DE SEGURIDAD
        .single();

    if (error) {
        // Si no existe o no es visible, Supabase devuelve error. Retornamos null para manejar el 404.
        return null;
    }

    return data as CapacitacionRow;
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
        throw new Error('Fallo al crear la capacitación.');
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
            throw new Error('No se puede eliminar. Tiene dependencias asociadas.');
        }
        throw new Error('Fallo al eliminar la capacitación.');
    }
}