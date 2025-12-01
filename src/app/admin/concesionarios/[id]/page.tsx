import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Wrench } from 'lucide-react';
import AdminNavbar from '@/components/ui/AdminNavbar';
import { getConcesionarioById } from '@/lib/services/concesionario.service';
import { getMecanicosByConcesionario } from '@/lib/services/mecanico.service';
import { isSuperAdmin } from '@/lib/utils/auth.utils';
import MecanicoTable from '@/components/admin/concesionarios/MecanicoTable';
import MecanicoForm from '@/components/admin/concesionarios/MecanicoForm';

interface PageProps {
    params: {
        id: string;
    };
}

// Forzamos dinamismo para evitar caché
export const dynamic = 'force-dynamic';

export default async function ConcesionarioDetallePage({ params }: PageProps) {
    const id = parseInt(params.id);
    if (isNaN(id)) notFound();

    // 1. Auth Check
    const hasAccess = await isSuperAdmin();
    if (!hasAccess) {
        redirect('/admin/dashboard');
    }

    // 2. Data Fetching (Paralelo)
    const [concesionario, mecanicos] = await Promise.all([
        getConcesionarioById(id),
        getMecanicosByConcesionario(id)
    ]);

    // Si no existe, 404
    if (!concesionario) {
        notFound();
    }

    return (
        <>
            <AdminNavbar />
            
            <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-[calc(100vh-64px)]">
                
                {/* Botón Volver */}
                <div className="mb-6">
                    <Link 
                        href="/admin/concesionarios" 
                        className="inline-flex items-center text-gray-500 hover:text-crucianelli-secondary transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al listado
                    </Link>
                </div>

                {/* Encabezado del Concesionario */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-6 w-6 text-crucianelli-secondary" />
                            <h1 className="text-2xl font-bold text-gray-900">
                                {concesionario.nombre}
                            </h1>
                        </div>
                        <p className="text-gray-500 text-sm ml-8">
                            ID Concesionario: <span className="font-mono text-gray-700">{concesionario.id}</span>
                        </p>
                    </div>

                    {/* Botón Nuevo Mecánico */}
                    <div className="flex-shrink-0">
                        <MecanicoForm concesionarioId={concesionario.id} />
                    </div>
                </div>

                {/* Sección de Mecánicos */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                        <Wrench className="h-5 w-5 text-gray-500" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Equipo de Taller ({mecanicos.length})
                        </h2>
                    </div>

                    {/* Tabla de Mecánicos */}
                    <MecanicoTable 
                        mecanicos={mecanicos} 
                        concesionarioId={concesionario.id} 
                    />
                </div>

            </div>
        </>
    );
}