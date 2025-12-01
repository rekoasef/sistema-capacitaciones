import { redirect } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import AdminNavbar from '@/components/ui/AdminNavbar';
import { createClient } from '@/lib/supabase/server';
import { getReporteGeneral } from '@/lib/services/reportes.service';
import ReportsDashboard from '@/components/admin/reportes/ReportsDashboard';

// Servicios para llenar los filtros
import { getCapacitaciones } from '@/lib/services/capacitacion.service';
import { getGruposByCapacitacion } from '@/lib/services/grupo.service';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: { [key: string]: string | undefined };
}

export default async function ReportesPage({ searchParams }: PageProps) {
    const supabase = createClient();

    // 1. Seguridad
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        redirect('/admin/login');
    }

    // 2. Leer Filtros de la URL
    const capacitacionId = searchParams.capacitacion ? parseInt(searchParams.capacitacion) : undefined;
    const grupoId = searchParams.grupo ? parseInt(searchParams.grupo) : undefined;

    // 3. Fetch Data en Paralelo (Métricas + Opciones para filtros)
    const statsPromise = getReporteGeneral({ capacitacionId, grupoId });
    const capacitacionesPromise = getCapacitaciones(); // Para el select de cursos
    
    // Solo buscamos grupos si hay un curso seleccionado (Optimización)
    const gruposPromise = capacitacionId ? getGruposByCapacitacion(capacitacionId) : Promise.resolve([]);

    const [stats, capacitaciones, grupos] = await Promise.all([
        statsPromise,
        capacitacionesPromise,
        gruposPromise
    ]);

    return (
        <>
            <AdminNavbar />
            
            <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-[calc(100vh-64px)]">
                
                <div className="flex items-center mb-8">
                    <div className="p-3 bg-white border border-gray-200 rounded-lg mr-4 shadow-sm">
                        <BarChart3 className="w-8 h-8 text-crucianelli-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Reportes y Métricas</h1>
                        <p className="text-gray-500 text-sm">
                            Analiza el rendimiento filtrando por capacitación o grupos específicos.
                        </p>
                    </div>
                </div>

                {/* Pasamos datos y opciones de filtro al cliente */}
                <ReportsDashboard 
                    stats={stats} 
                    capacitaciones={capacitaciones}
                    grupos={grupos}
                />
                
            </div>
        </>
    );
}