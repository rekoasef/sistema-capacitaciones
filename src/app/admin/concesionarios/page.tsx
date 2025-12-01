import { getConcesionarios } from '@/lib/services/concesionario.service';
import ConcesionarioTable from '@/components/admin/concesionarios/ConcesionarioTable';
import ConcesionarioForm from '@/components/admin/concesionarios/ConcesionarioForm';
import { isSuperAdmin } from '@/lib/utils/auth.utils';
import { AlertTriangle } from 'lucide-react';
import AdminNavbar from '@/components/ui/AdminNavbar'; // Agregamos Navbar aquí también para consistencia

export const dynamic = 'force-dynamic';

export default async function ConcesionariosPage() {
    
    // 1. Autorización
    const hasAccess = await isSuperAdmin();
    
    if (!hasAccess) {
        return (
            <div className="p-6 bg-white rounded-xl shadow-lg text-center mt-10 mx-auto max-w-md">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p className="text-gray-600 mt-2">No tienes permisos para ver esto.</p>
            </div>
        );
    }

    // 2. Carga de datos
    const concesionarios = await getConcesionarios();

    // 3. Renderizado
    return (
        <>
            <AdminNavbar />
            
            {/* Contenedor principal de la página */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-crucianelli-secondary">
                        Gestión de Concesionarios
                    </h1>
                    
                    {/* CRÍTICO: Aquí estaba el error. Llamamos al componente SIN props de función. */}
                    <ConcesionarioForm />
                </div>

                <ConcesionarioTable concesionarios={concesionarios} />
                
                <p className="mt-4 text-sm text-gray-500 italic">
                    Nota: No se pueden eliminar concesionarios que tengan alumnos inscriptos.
                </p>
            </div>
        </>
    );
}