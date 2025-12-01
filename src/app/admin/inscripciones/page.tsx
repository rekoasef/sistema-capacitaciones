import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/ui/AdminNavbar'; //
import { createClient } from '@/lib/supabase/server'; //
import { getInscripcionesAdmin } from '@/lib/services/inscripcion.service'; //
import { getConcesionarios } from '@/lib/services/concesionario.service'; //
import { getCapacitaciones } from '@/lib/services/capacitacion.service'; //
import InscripcionesTable from '@/components/admin/inscripciones/InscripcionesTable'; //

export const dynamic = 'force-dynamic'; //

export default async function InscripcionesPage() {
    const supabase = createClient(); //

    // 1. Auth Check
    const { data: { session } } = await supabase.auth.getSession(); //
    if (!session) {
        redirect('/admin/login'); //
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
                
                {/* LIMPIEZA: Hemos eliminado el encabezado duplicado aquí.
                    Ahora el Título, el Contador y el Botón de Exportar son gestionados 
                    directamente por el componente InscripcionesTable para que reaccionen a los filtros.
                */}

                {/* Tabla Interactiva (Incluye Header y Botón Exportar) */}
                <InscripcionesTable 
                    initialData={inscripciones} 
                    concesionarios={concesionarios}
                    capacitaciones={capacitaciones}
                />
                
            </div>
        </>
    );
}