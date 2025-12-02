import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/ui/AdminNavbar';
import { createClient } from '@/lib/supabase/server';
import { getInscripcionesAdmin } from '@/lib/services/inscripcion.service';
import { getConcesionarios } from '@/lib/services/concesionario.service';
import { getCapacitaciones } from '@/lib/services/capacitacion.service';
// Importamos la nueva función
import { getAllGrupos } from '@/lib/services/grupo.service';
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
    const [inscripciones, concesionarios, capacitaciones, grupos] = await Promise.all([
        getInscripcionesAdmin(), 
        getConcesionarios(),     
        getCapacitaciones(),
        getAllGrupos() // Traemos todos los grupos
    ]);

    return (
        <>
            <AdminNavbar />
            
            <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-[calc(100vh-64px)]">
                {/* Tabla Interactiva */}
                <InscripcionesTable 
                    initialData={inscripciones} 
                    concesionarios={concesionarios}
                    capacitaciones={capacitaciones}
                    grupos={grupos} // Pasamos los grupos como prop
                />
            </div>
        </>
    );
}