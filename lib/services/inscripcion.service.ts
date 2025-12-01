import { createClient } from '@/lib/supabase/server';
import { InscripcionFormInputs } from '@/types/inscripcion.types';

// ====================================================================
// DEFINICIÓN DE TIPOS
// ====================================================================

// Quitamos 'mecanico_id' del tipo del formulario para redefinirlo como number
type CreateInscripcionParams = {
    grupo_id: number;
    concesionario_id: number;
    email_inscripto: string;
    nombre_inscripto: string; 
    telefono: string;
    mecanico_id?: number; 
} & Omit<Partial<InscripcionFormInputs>, 'mecanico_id'>;

// ====================================================================
// LÓGICA PÚBLICA (INSCRIPCIÓN)
// ====================================================================

export async function createInscripcion(data: CreateInscripcionParams): Promise<void> {
    const supabase = createClient();

    // 1. Obtener información del grupo
    const { data: grupo, error: grupoError } = await supabase
        .from('grupos')
        .select('cupo_maximo, nombre_grupo, estado')
        .eq('id', data.grupo_id)
        .single();

    if (grupoError || !grupo) {
        throw new Error('El grupo seleccionado no existe o no está disponible.');
    }

    if (grupo.estado !== 'activo') {
        throw new Error(`El grupo "${grupo.nombre_grupo}" no está habilitado para inscripciones.`);
    }

    // 2. Verificar el cupo actual
    const { count, error: countError } = await supabase
        .from('inscripciones')
        .select('*', { count: 'exact', head: true })
        .eq('grupo_id', data.grupo_id);

    if (countError) throw new Error('Error técnico al verificar disponibilidad.');

    if ((count || 0) >= grupo.cupo_maximo) {
        throw new Error(`El grupo "${grupo.nombre_grupo}" ya no tiene vacantes disponibles.`);
    }

    // 3. Verificar duplicados por email
    const { data: existente } = await supabase
        .from('inscripciones')
        .select('id')
        .eq('grupo_id', data.grupo_id)
        .eq('email_inscripto', data.email_inscripto)
        .single();

    if (existente) {
        throw new Error(`El correo ${data.email_inscripto} ya está registrado en este grupo.`);
    }

    // 4. Crear la inscripción
    const { error: insertError } = await supabase
        .from('inscripciones')
        .insert({
            grupo_id: data.grupo_id,
            concesionario_id: data.concesionario_id,
            nombre_inscripto: data.nombre_inscripto,
            email_inscripto: data.email_inscripto,
            telefono: data.telefono,
            mecanico_id: data.mecanico_id 
        });

    if (insertError) {
        console.error('Error al inscribir:', insertError.message);
        throw new Error('Hubo un problema al procesar tu inscripción.');
    }
}

// ====================================================================
// LÓGICA ADMINISTRATIVA (GESTIÓN Y REPORTES)
// ====================================================================

export interface InscripcionAdminRow {
    id: string; 
    created_at: string;
    nombre_inscripto: string;
    email_inscripto: string;
    telefono: string | null;
    asistencia_marcada: string; 
    nombre_concesionario: string;
    nombre_grupo: string;
    nombre_capacitacion: string;
    mecanico_created_at: string | null; // <--- AQUÍ ESTÁ EL CAMBIO CRÍTICO
}

interface InscripcionFilters {
    capacitacionId?: number;
    concesionarioId?: number;
    busqueda?: string;
}

export async function getInscripcionesAdmin(filters?: InscripcionFilters): Promise<InscripcionAdminRow[]> {
    const supabase = createClient();

    // Modificamos la query para traer datos del mecánico relacionado
    // OJO: Usamos 'mecanico:mecanicos' para hacer el join y traer created_at
    let selectQuery = `
        *,
        concesionario:concesionarios(nombre),
        grupo:grupos (
            nombre_grupo,
            capacitacion:capacitaciones(id, nombre)
        ),
        mecanico:mecanicos(created_at) 
    `;

    if (filters?.capacitacionId) {
        selectQuery = `
            *,
            concesionario:concesionarios(nombre),
            grupo:grupos!inner (
                nombre_grupo,
                capacitacion_id,
                capacitacion:capacitaciones(id, nombre)
            ),
            mecanico:mecanicos(created_at)
        `;
    }

    let query = supabase
        .from('inscripciones')
        .select(selectQuery)
        .order('created_at', { ascending: false });

    if (filters?.concesionarioId) {
        query = query.eq('concesionario_id', filters.concesionarioId);
    }

    if (filters?.capacitacionId) {
        query = query.eq('grupo.capacitacion_id', filters.capacitacionId);
    }

    if (filters?.busqueda) {
        query = query.or(`nombre_inscripto.ilike.%${filters.busqueda}%,email_inscripto.ilike.%${filters.busqueda}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error al obtener inscripciones admin:', error.message);
        throw new Error('No se pudo cargar la lista de inscriptos.');
    }

    return (data || []).map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        nombre_inscripto: item.nombre_inscripto,
        email_inscripto: item.email_inscripto,
        telefono: item.telefono,
        asistencia_marcada: item.asistencia_marcada, 
        nombre_concesionario: item.concesionario?.nombre || 'Desconocido',
        nombre_grupo: item.grupo?.nombre_grupo || 'Sin Grupo',
        nombre_capacitacion: item.grupo?.capacitacion?.nombre || 'Sin Curso',
        // Mapeamos la fecha de creación del mecánico (puede ser null si es un mecánico viejo o borrado)
        mecanico_created_at: item.mecanico?.created_at || null 
    }));
}

export async function deleteInscripcion(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('inscripciones').delete().eq('id', id);
    if (error) {
        console.error('Error al eliminar inscripción:', error.message);
        throw new Error('No se pudo dar de baja la inscripción.');
    }
}

export async function updateAsistencia(id: string, estado: string): Promise<void> {
    const supabase = createClient();
    const estadosValidos = ['pendiente', 'presente', 'ausente'];
    if (!estadosValidos.includes(estado)) {
        throw new Error('Estado de asistencia no válido.');
    }

    const { data, error } = await supabase
        .from('inscripciones')
        .update({ asistencia_marcada: estado } as any) 
        .eq('id', id)
        .select();

    if (error) {
        console.error("🔴 ERROR SUPABASE UPDATE:", error); 
        throw new Error('Error al actualizar la asistencia.');
    }
    
    if (!data || data.length === 0) {
        throw new Error("No se pudo guardar. Verifica permisos.");
    }
}