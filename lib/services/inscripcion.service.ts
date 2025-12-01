import { createClient } from '@/lib/supabase/server';
import { InscripcionFormInputs } from '@/types/inscripcion.types';

// ====================================================================
// LÓGICA PÚBLICA (INSCRIPCIÓN)
// ====================================================================

/**
 * Crea una nueva inscripción verificando cupos y duplicados.
 */
export async function createInscripcion(data: InscripcionFormInputs): Promise<void> {
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
            asistencia_marcada: false
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
    asistencia_marcada: boolean;
    nombre_concesionario: string;
    nombre_grupo: string;
    nombre_capacitacion: string;
}

interface InscripcionFilters {
    capacitacionId?: number;
    concesionarioId?: number;
    busqueda?: string;
}

/**
 * Obtiene el listado de inscripciones con filtros para el panel admin.
 * CORREGIDO: Construcción dinámica de la query para evitar conflictos de tipos.
 */
export async function getInscripcionesAdmin(filters?: InscripcionFilters): Promise<InscripcionAdminRow[]> {
    const supabase = createClient();

    // 1. Construir el string de selección dinámicamente
    // Si filtramos por capacitación, necesitamos !inner en grupos para que el filtro 'grupo.capacitacion_id'
    // excluya las filas que no coinciden. Si no, usamos join normal.
    let selectQuery = `
        *,
        concesionario:concesionarios(nombre),
        grupo:grupos (
            nombre_grupo,
            capacitacion:capacitaciones(id, nombre)
        )
    `;

    if (filters?.capacitacionId) {
        selectQuery = `
            *,
            concesionario:concesionarios(nombre),
            grupo:grupos!inner (
                nombre_grupo,
                capacitacion_id,
                capacitacion:capacitaciones(id, nombre)
            )
        `;
    }

    // 2. Inicializar la consulta UNA SOLA VEZ
    let query = supabase
        .from('inscripciones')
        .select(selectQuery)
        .order('created_at', { ascending: false });

    // 3. Aplicar filtros acumulativos
    if (filters?.concesionarioId) {
        query = query.eq('concesionario_id', filters.concesionarioId);
    }

    if (filters?.capacitacionId) {
        // Al usar !inner arriba, este filtro funciona correctamente sobre la relación
        query = query.eq('grupo.capacitacion_id', filters.capacitacionId);
    }

    if (filters?.busqueda) {
        query = query.or(`nombre_inscripto.ilike.%${filters.busqueda}%,email_inscripto.ilike.%${filters.busqueda}%`);
    }

    // 4. Ejecutar
    const { data, error } = await query;

    if (error) {
        console.error('Error al obtener inscripciones admin:', error.message);
        throw new Error('No se pudo cargar la lista de inscriptos.');
    }

    // 5. Mapeo de datos
    return (data || []).map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        nombre_inscripto: item.nombre_inscripto,
        email_inscripto: item.email_inscripto,
        telefono: item.telefono,
        asistencia_marcada: item.asistencia_marcada,
        nombre_concesionario: item.concesionario?.nombre || 'Desconocido',
        nombre_grupo: item.grupo?.nombre_grupo || 'Sin Grupo',
        nombre_capacitacion: item.grupo?.capacitacion?.nombre || 'Sin Curso'
    }));
}

/**
 * Elimina una inscripción (Admin).
 */
export async function deleteInscripcion(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('inscripciones')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error al eliminar inscripción:', error.message);
        throw new Error('No se pudo dar de baja la inscripción.');
    }
}

/**
 * Marca la asistencia de un alumno (Admin).
 */
export async function toggleAsistencia(id: string, asistio: boolean): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from('inscripciones')
        .update({ asistencia_marcada: asistio })
        .eq('id', id);

    if (error) {
        throw new Error('Error al actualizar la asistencia.');
    }
}