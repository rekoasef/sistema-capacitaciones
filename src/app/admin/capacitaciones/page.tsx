import { getCapacitacionesAction } from '@/lib/actions/capacitacion.actions'; // Server Action para obtener la data
import CapacitacionTable from '@/components/admin/capacitaciones/CapacitacionTable';
import CapacitacionForm from '@/components/admin/capacitaciones/CapacitacionForm'; // Usado para el botón de 'Nuevo'
import { isSuperAdmin } from '@/lib/utils/auth.utils';
import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

// Esta página es un Server Component, ideal para la carga de datos.
export default async function CapacitacionesPage() {
    
    // 1. Autorización (ya resuelta a TRUE por RPC)
    const hasAccess = await isSuperAdmin();
    
    if (!hasAccess) {
        // Redireccionar si no tiene acceso (aunque el middleware debería atrapar esto)
        return (
            <div className="p-6 bg-white rounded-xl shadow-lg text-center">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p className="text-gray-600 mt-2">No tienes los permisos necesarios (SuperAdmin) para acceder a este módulo.</p>
                <Link href="/admin/dashboard" className="mt-4 inline-flex items-center text-crucianelli-secondary hover:text-crucianelli-primary font-medium">
                    <Home className="w-4 h-4 mr-1" />
                    Volver al Dashboard
                </Link>
            </div>
        );
    }

    // 2. Carga de datos (CRÍTICO: Manejo de errores aquí)
    const result = await getCapacitacionesAction();
    
    if (!result || result.success === false) {
        return (
            <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-semibold">Error al cargar las capacitaciones:</p>
                <p>{result?.message || 'Fallo de conexión o autorización al obtener datos.'}</p>
            </div>
        );
    }
    
    const capacitaciones = result.data; // Datos seguros

    // 3. Renderizado de UI
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-crucianelli-secondary">
                    Gestión de Capacitaciones
                </h1>
                
                {/* Botón de Nueva Capacitación (FIX: Eliminamos la prop onSuccess del SC) */}
                <CapacitacionForm /> 
            </div>
            
            {/* Se pasa la lista de capacitaciones como PROP a la tabla */}
            <CapacitacionTable capacitaciones={capacitaciones} /> 
            
            <p className="mt-4 text-sm text-gray-500 italic">
                Nota: Eliminar una capacitación eliminará automáticamente todos los grupos y días asociados (Restricción ON DELETE CASCADE).
            </p>
        </>
    );
}