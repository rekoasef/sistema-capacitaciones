import { redirect } from 'next/navigation';
import { Users, FileSpreadsheet } from 'lucide-react';
import AdminNavbar from '@/components/ui/AdminNavbar';
import { createClient } from '@/lib/supabase/server';
import { getInscripcionesAdmin } from '@/lib/services/inscripcion.service';
import { getConcesionarios } from '@/lib/services/concesionario.service';
import { getCapacitaciones } from '@/lib/services/capacitacion.service';
import InscripcionesTable from '@/components/admin/inscripciones/InscripcionesTable';

export const dynamic = 'force-dynamic';

export default async function InscripcionesPage() {
    const supabase = createClient();

    // 1. Auth Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        redirect('/admin/login');
    }

    // 2. Fetch Data (Paralelo para optimizar carga)
    const [inscripciones, concesionarios, capacitaciones] = await Promise.all([
        getInscripcionesAdmin(), // Trae todas las inscripciones
        getConcesionarios(),     // Para el filtro de concesionarios
        getCapacitaciones()      // Para el filtro de cursos
    ]);

    return (
        <>
            <AdminNavbar />
            
            <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-[calc(100vh-64px)]">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center">
                        <div className="p-3 bg-white border border-gray-200 rounded-lg mr-4 shadow-sm">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Gestión de Inscripciones</h1>
                            <p className="text-gray-500 text-sm">
                                {inscripciones.length} registros totales en la base de datos.
                            </p>
                        </div>
                    </div>
                    
                    {/* Botón de Exportar (Placeholder funcional para futuro) */}
                    <button 
                        disabled
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg opacity-70 cursor-not-allowed text-sm font-medium"
                        title="Próximamente"
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Exportar Excel
                    </button>
                </div>

                {/* Tabla Interactiva */}
                <InscripcionesTable 
                    initialData={inscripciones} 
                    concesionarios={concesionarios}
                    capacitaciones={capacitaciones}
                />
                
            </div>
        </>
    );
}