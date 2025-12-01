import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

// Tipos base
type Concesionario = Database['public']['Tables']['concesionarios']['Row'];
type ConcesionarioInsert = Database['public']['Tables']['concesionarios']['Insert'];
type ConcesionarioUpdate = Database['public']['Tables']['concesionarios']['Update'];

// ====================================================================
// Servicio para interactuar con la tabla 'concesionarios'
// ====================================================================

/**
 * Obtiene todos los concesionarios (PANEL ADMIN).
 */
export async function getConcesionarios(): Promise<Concesionario[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
        .from('concesionarios')
        .select('*')
        .order('nombre', { ascending: true });

    if (error) {
        console.error('Error al obtener concesionarios:', error.message);
        throw new Error('Fallo al cargar la lista de concesionarios.');
    }

    return data as Concesionario[];
}

/**
 * Obtiene un concesionario por su ID (NUEVO).
 * Necesario para la página de detalles /admin/concesionarios/[id]
 */
export async function getConcesionarioById(id: number): Promise<Concesionario | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('concesionarios')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error al obtener concesionario ${id}:`, error.message);
        return null;
    }

    return data as Concesionario;
}

/**
 * Obtiene lista simplificada de concesionarios para el FORMULARIO PÚBLICO.
 */
export async function getConcesionariosPublicos(): Promise<Concesionario[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
        .from('concesionarios')
        .select('id, nombre')
        .order('nombre', { ascending: true });

    if (error) {
        console.error('Error al cargar concesionarios públicos:', error.message);
        return [];
    }

    return data as Concesionario[];
}

/**
 * Crea un nuevo concesionario.
 */
export async function createConcesionario(data: ConcesionarioInsert): Promise<Concesionario> {
    const supabase = createClient();

    const { data: concesionario, error } = await supabase
        .from('concesionarios')
        .insert(data)
        .select()
        .single();
    
    if (error) {
        if (error.code === '23505') { 
            throw new Error('Ya existe un concesionario con este nombre.');
        }
        console.error('Error al crear concesionario:', error.message);
        throw new Error('Fallo al crear el concesionario. Inténtalo de nuevo.');
    }

    return concesionario as Concesionario;
}

/**
 * Actualiza un concesionario existente.
 */
export async function updateConcesionario(id: number, data: ConcesionarioUpdate): Promise<Concesionario> {
    const supabase = createClient();

    const { data: concesionario, error } = await supabase
        .from('concesionarios')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
         if (error.code === '23505') { 
            throw new Error('Ya existe un concesionario con este nombre.');
        }
        console.error('Error al actualizar concesionario:', error.message);
        throw new Error('Fallo al actualizar el concesionario.');
    }

    return concesionario as Concesionario;
}

/**
 * Elimina un concesionario.
 */
export async function deleteConcesionario(id: number): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('concesionarios')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error al eliminar concesionario:', error.message);
        if (error.code === '23503') { 
            throw new Error('No se puede eliminar. Este concesionario tiene inscripciones asociadas.');
        }
        throw new Error('Fallo al eliminar el concesionario.');
    }
}