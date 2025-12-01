import { getCapacitacionesAction } from '@/lib/actions/capacitacion.actions'; 
import CapacitacionTable from '@/components/admin/capacitaciones/CapacitacionTable';
import CapacitacionForm from '@/components/admin/capacitaciones/CapacitacionForm'; 
import { isSuperAdmin } from '@/lib/utils/auth.utils';
import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';
import AdminNavbar from '@/components/ui/AdminNavbar'; // Importamos el Navbar

// Forzamos dinamismo para evitar caché agresiva en el admin
export const dynamic = 'force-dynamic';

export default async function CapacitacionesPage() {
    
    // 1. Autorización
    const hasAccess = await isSuperAdmin();
    
    if (!hasAccess) {
        return (
            <div className="p-6 bg-white rounded-xl shadow-lg text-center mt-10 mx-auto max-w-md">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p className="text-gray-600 mt-2">No tienes los permisos necesarios.</p>
                <Link href="/admin/dashboard" className="mt-4 inline-flex items-center text-crucianelli-secondary hover:text-crucianelli-primary font-medium">
                    <Home className="w-4 h-4 mr-1" />
                    Volver al Dashboard
                </Link>
            </div>
        );
    }

    // 2. Carga de datos
    const result = await getCapacitacionesAction();
    
    if (!result || result.success === false) {
        return (
            <>
                <AdminNavbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <p className="font-semibold">Error al cargar las capacitaciones:</p>
                        <p>{result?.message || 'Fallo de conexión.'}</p>
                    </div>
                </div>
            </>
        );
    }
    
    const capacitaciones = result.data; 

    // 3. Renderizado de UI
    return (
        <>
            {/* Agregamos el Navbar aquí */}
            <AdminNavbar />

            {/* Envolvemos el contenido en un container para centrarlo y darle márgenes */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-crucianelli-secondary">
                        Gestión de Capacitaciones
                    </h1>
                    
                    <CapacitacionForm /> 
                </div>
                
                <CapacitacionTable capacitaciones={capacitaciones} /> 
                
                <p className="mt-4 text-sm text-gray-500 italic">
                    Nota: Eliminar una capacitación eliminará automáticamente todos los grupos y días asociados (Restricción ON DELETE CASCADE).
                </p>
            </div>
        </>
    );
}