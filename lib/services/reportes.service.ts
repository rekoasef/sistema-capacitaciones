import { createClient } from '@/lib/supabase/server';

export interface KPIStats {
    totalInscripciones: number;
    tasaAsistenciaGlobal: number;
    concesionariosTop: { name: string; value: number }[];
    inscripcionesPorMes: { name: string; inscritos: number; asistentes: number }[];
}

export interface ReporteFilters {
    capacitacionId?: number;
    grupoId?: number;
}

/**
 * Obtiene y calcula todas las métricas, aplicando filtros opcionales.
 */
export async function getReporteGeneral(filters?: ReporteFilters): Promise<KPIStats> {
    const supabase = createClient();

    // LOG DE DEPURACIÓN (Servidor)
    console.log("🔍 [Reportes Service] Filtros recibidos:", filters);

    // 1. Construcción de la Query Dinámica
    let query = supabase
        .from('inscripciones')
        .select(`
            id,
            created_at,
            asistencia_marcada,
            concesionario:concesionarios (nombre),
            grupo:grupos!inner (
                id,
                capacitacion_id
            )
        `);

    // 2. Aplicar Filtros
    if (filters?.capacitacionId) {
        console.log(`   -> Filtrando por Capacitación ID: ${filters.capacitacionId}`);
        query = query.eq('grupo.capacitacion_id', filters.capacitacionId);
    }
    
    if (filters?.grupoId) {
        console.log(`   -> Filtrando por Grupo ID: ${filters.grupoId}`);
        query = query.eq('grupo_id', filters.grupoId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("🔴 [Reportes Service] Error en DB:", error.message);
        return {
            totalInscripciones: 0,
            tasaAsistenciaGlobal: 0,
            concesionariosTop: [],
            inscripcionesPorMes: []
        };
    }

    console.log(`✅ [Reportes Service] Datos encontrados: ${data?.length || 0} registros.`);

    if (!data || data.length === 0) {
        return {
            totalInscripciones: 0,
            tasaAsistenciaGlobal: 0,
            concesionariosTop: [],
            inscripcionesPorMes: []
        };
    }

    // 3. Procesamiento de Métricas

    // A. Totales
    const total = data.length;
    const presentes = data.filter(d => d.asistencia_marcada === 'presente').length;
    const tasa = total > 0 ? Math.round((presentes / total) * 100) : 0;

    // B. Ranking
    const concesionarioCount: Record<string, number> = {};
    data.forEach(row => {
        // @ts-ignore
        const nombre = row.concesionario?.nombre || 'Desconocido';
        concesionarioCount[nombre] = (concesionarioCount[nombre] || 0) + 1;
    });

    const concesionariosTop = Object.entries(concesionarioCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); 

    // C. Evolución
    const mesesCount: Record<string, { inscritos: number, asistentes: number }> = {};
    const ordenMeses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

    data.forEach(row => {
        if (!row.created_at) return;
        const fecha = new Date(row.created_at);
        const mesStr = fecha.toLocaleString('es-AR', { month: 'short' }).toLowerCase(); 
        
        if (!mesesCount[mesStr]) {
            mesesCount[mesStr] = { inscritos: 0, asistentes: 0 };
        }
        mesesCount[mesStr].inscritos += 1;
        if (row.asistencia_marcada === 'presente') {
            mesesCount[mesStr].asistentes += 1;
        }
    });

    const inscripcionesPorMes = Object.entries(mesesCount)
        .map(([name, valores]) => ({ 
            name: name.charAt(0).toUpperCase() + name.slice(1),
            ...valores 
        }))
        .sort((a, b) => {
            const indexA = ordenMeses.indexOf(a.name.toLowerCase().slice(0,3));
            const indexB = ordenMeses.indexOf(b.name.toLowerCase().slice(0,3));
            return indexA - indexB;
        });

    return {
        totalInscripciones: total,
        tasaAsistenciaGlobal: tasa,
        concesionariosTop,
        inscripcionesPorMes
    };
}