import { getConcesionarios } from '@/lib/services/concesionario.service'; // FIX: Ruta relativa
import ConcesionarioTable from '@/components/admin/concesionarios/ConcesionarioTable'; // FIX: Ruta relativa
import ConcesionarioForm from '@/components/admin/concesionarios/ConcesionarioForm'; // FIX: Ruta relativa
import { isSuperAdmin } from '@/lib/utils/auth.utils'; // FIX: Ruta relativa
import { redirect } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

// Esta página es un Server Component que maneja la carga de datos.
export default async function ConcesionariosPage() {
    
    // 1. Autorización: Verificación de Rol (Nivel de seguridad Server Component)
    const hasAccess = await isSuperAdmin();
    
    // Si no es SuperAdmin, redirigir al dashboard o mostrar error de acceso
    if (!hasAccess) {
        // En un futuro podríamos tener un rol 'Auditor' que solo lee.
        // Por ahora, solo SuperAdmin tiene acceso a esta ruta.
        return (
            <div className="p-6 bg-white rounded-xl shadow-lg text-center">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p className="text-gray-600 mt-2">No tienes los permisos necesarios (SuperAdmin) para acceder a este módulo.</p>
            </div>
        );
    }

    // 2. Carga de datos
    // La RLS de Supabase garantiza que solo los SuperAdmins puedan leer estos datos.
    const concesionarios = await getConcesionarios();

    // 3. Renderizado de UI
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-crucianelli-secondary">
                    Gestión de Concesionarios
                </h1>
                
                {/* Botón de Nuevo Concesionario (abre el modal de Creación) */}
                {/* El Server Component renderiza el Client Component del formulario */}
                <ConcesionarioForm 
                    // No pasamos concesionario para el modo Creación
                    onSuccess={() => {}} // La acción ya refresca la página
                />
            </div>

            <ConcesionarioTable concesionarios={concesionarios} />
            
            <p className="mt-4 text-sm text-gray-500 italic">
                Nota: La eliminación de un concesionario fallará si tiene inscripciones asociadas (Restricción de FK).
            </p>
        </>
    );
}