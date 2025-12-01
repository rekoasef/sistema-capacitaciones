import { createClient } from '@/lib/supabase/server';
import { GrupoFormInputs, GrupoWithDias } from '@/types/grupo.types';

// ====================================================================
// Servicio para interactuar con las tablas 'grupos' y 'dias_grupo'
// ====================================================================

/**
 * Obtiene TODOS los grupos de una capacitación (ADMIN).
 * Incluye inactivos, para gestión interna.
 */
export async function getGruposByCapacitacion(capacitacionId: number): Promise<GrupoWithDias[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('grupos')
        .select(`
            *,
            dias:dias_grupo(*)
        `)
        .eq('capacitacion_id', capacitacionId)
        .order('id', { ascending: true }); 

    if (error) {
        console.error('Error al obtener grupos (Admin):', error.message);
        throw new Error('No se pudieron cargar los grupos.');
    }

    // Ordenar días
    return processGruposData(data);
}

/**
 * Obtiene SOLO los grupos visibles para el PÚBLICO.
 * Filtra los 'inactivos' y ordena para mostrar la oferta relevante.
 */
export async function getGruposPublicos(capacitacionId: number): Promise<GrupoWithDias[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('grupos')
        .select(`
            *,
            dias:dias_grupo(*)
        `)
        .eq('capacitacion_id', capacitacionId)
        // Filtro de seguridad: Solo mostramos lo que el usuario puede ver
        .in('estado', ['activo', 'lleno', 'cerrado']) 
        .order('id', { ascending: true });

    if (error) {
        // Fail-safe para portal público
        console.error('Error al obtener grupos públicos:', error.message);
        return [];
    }

    return processGruposData(data);
}

// Helper para procesar y ordenar los días (evita duplicar código)
function processGruposData(data: any[] | null): GrupoWithDias[] {
    if (!data) return [];
    
    return data.map(grupo => ({
        ...grupo,
        // @ts-ignore: Supabase join typing
        dias: Array.isArray(grupo.dias) 
            // @ts-ignore: Supabase join typing
            ? grupo.dias.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()) 
            : []
    })) as GrupoWithDias[];
}

/**
 * Crea un nuevo grupo y sus días asociados.
 */
export async function createGrupo(data: GrupoFormInputs): Promise<void> {
    const supabase = createClient();
    
    // 1. Insertar el Encabezado
    const { data: grupo, error: grupoError } = await supabase
        .from('grupos')
        .insert({
            capacitacion_id: data.capacitacion_id,
            nombre_grupo: data.nombre_grupo,
            cupo_maximo: data.cupo_maximo,
            estado: data.estado
        })
        .select()
        .single();

    if (grupoError || !grupo) {
        console.error('Error creando grupo:', grupoError?.message);
        throw new Error('Fallo al crear el grupo.');
    }

    // 2. Insertar los días
    const diasToInsert = data.dias.map(dia => ({
        grupo_id: grupo.id,
        fecha: dia.fecha,
        hora_inicio: dia.hora_inicio,
        hora_fin: dia.hora_fin
    }));

    const { error: diasError } = await supabase
        .from('dias_grupo')
        .insert(diasToInsert);

    if (diasError) {
        console.error('Error creando días:', diasError.message);
        await supabase.from('grupos').delete().eq('id', grupo.id); // Rollback
        throw new Error('Fallo al guardar días. Operación cancelada.');
    }
}

/**
 * Actualiza un grupo existente (Smart Update).
 */
export async function updateGrupo(data: GrupoFormInputs): Promise<void> {
    const supabase = createClient();

    if (!data.id) throw new Error('ID del grupo requerido.');

    // 1. Actualizar Encabezado
    const { error: grupoError } = await supabase
        .from('grupos')
        .update({
            nombre_grupo: data.nombre_grupo,
            cupo_maximo: data.cupo_maximo,
            estado: data.estado
        })
        .eq('id', data.id);

    if (grupoError) throw new Error('Fallo al actualizar el grupo.');

    // 2. Gestión de Días
    const currentDayIds = data.dias
        .map(d => d.id)
        .filter((id): id is number => id !== undefined);

    // Delete orphaned
    if (currentDayIds.length > 0) {
        await supabase
            .from('dias_grupo')
            .delete()
            .eq('grupo_id', data.id)
            .not('id', 'in', `(${currentDayIds.join(',')})`);
    } else {
        await supabase.from('dias_grupo').delete().eq('grupo_id', data.id);
    }

    // Upsert
    const daysToUpsert = data.dias.map(dia => ({
        id: dia.id, 
        grupo_id: data.id as number, 
        fecha: dia.fecha,
        hora_inicio: dia.hora_inicio,
        hora_fin: dia.hora_fin
    }));

    // @ts-ignore: Bypass para upsert con ID generado
    const { error: diasError } = await supabase
        .from('dias_grupo')
        .upsert(daysToUpsert as any);

    if (diasError) throw new Error('Error al actualizar el cronograma.');
}

/**
 * Elimina un grupo.
 */
export async function deleteGrupo(id: number): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('grupos').delete().eq('id', id);
    if (error) throw new Error('No se pudo eliminar el grupo.');
}