import { createClient } from '@/lib/supabase/server';

export interface DashboardStats {
    totalInscriptos: number;
    capacitacionesActivas: number;
    gruposActivos: number;
    tasaAsistencia: number; // Porcentaje
    ultimasInscripciones: any[]; // Lista breve para el feed de actividad
}

/**
 * Obtiene las métricas principales para el Dashboard Administrativo.
 * Optimizado para rendimiento usando 'count' en base de datos.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = createClient();

    // 1. Ejecutamos las consultas en paralelo para minimizar el tiempo de espera
    const [
        inscriptosResult,
        capacitacionesResult,
        gruposResult,
        asistenciaResult,
        feedResult
    ] = await Promise.all([
        // A. Total de Inscriptos Histórico
        supabase.from('inscripciones').select('*', { count: 'exact', head: true }),
        
        // B. Capacitaciones Visibles (Oferta actual)
        supabase.from('capacitaciones').select('*', { count: 'exact', head: true }).eq('estado', 'visible'),
        
        // C. Grupos Activos (Donde la gente se puede anotar hoy)
        supabase.from('grupos').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),

        // D. Asistencias Confirmadas (Para calcular tasa)
        // FIX CRÍTICO: Cambiado 'true' (boolean) por 'presente' (string) para coincidir con la DB
        supabase.from('inscripciones').select('*', { count: 'exact', head: true }).eq('asistencia_marcada', 'presente'),

        // E. Feed: Últimas 5 inscripciones con datos relacionales (Nombre curso + Concesionario)
        supabase.from('inscripciones')
            .select(`
                id,
                created_at,
                nombre_inscripto,
                grupo:grupos (
                    nombre_grupo,
                    capacitacion:capacitaciones (nombre)
                ),
                concesionario:concesionarios (nombre)
            `)
            .order('created_at', { ascending: false })
            .limit(5)
    ]);

    // 2. Procesamos los resultados
    const totalInscriptos = inscriptosResult.count || 0;
    const totalAsistencias = asistenciaResult.count || 0;

    // Cálculo de porcentaje (evitando división por cero)
    const tasaAsistencia = totalInscriptos > 0 
        ? Math.round((totalAsistencias / totalInscriptos) * 100) 
        : 0;

    // Mapeo simple para el feed
    const ultimasInscripciones = feedResult.data?.map(ins => ({
        id: ins.id,
        fecha: ins.created_at,
        alumno: ins.nombre_inscripto,
        // @ts-ignore: Supabase join types complex handling
        curso: ins.grupo?.capacitacion?.nombre || 'Curso eliminado',
        // @ts-ignore
        grupo: ins.grupo?.nombre_grupo || '',
        // @ts-ignore
        concesionario: ins.concesionario?.nombre || 'Particular'
    })) || [];

    return {
        totalInscriptos,
        capacitacionesActivas: capacitacionesResult.count || 0,
        gruposActivos: gruposResult.count || 0,
        tasaAsistencia,
        ultimasInscripciones
    };
}