import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, MapPin } from 'lucide-react';
import AdminNavbar from '@/components/ui/AdminNavbar';
import { getCapacitacionById } from '@/lib/services/capacitacion.service';
import { getGruposByCapacitacion } from '@/lib/services/grupo.service';
import { isSuperAdmin } from '@/lib/utils/auth.utils';

// Importaremos estos componentes en los siguientes pasos
// Por ahora, el código asumirá que existen en estas rutas
import GroupTable from '@/components/admin/grupos/GroupTable'; 
import GroupForm from '@/components/admin/grupos/GroupForm'; 

interface PageProps {
    params: {
        id: string;
    };
}

export default async function CapacitacionDetallePage({ params }: PageProps) {
    const id = parseInt(params.id);
    if (isNaN(id)) notFound();

    // 1. Verificación de Seguridad (RBAC)
    const hasAccess = await isSuperAdmin();
    if (!hasAccess) {
        redirect('/admin/dashboard');
    }

    // 2. Carga de Datos en Paralelo (Eficiencia)
    const [capacitacion, grupos] = await Promise.all([
        getCapacitacionById(id),
        getGruposByCapacitacion(id)
    ]);

    // Si la capacitación no existe, mostrar 404
    if (!capacitacion) {
        notFound();
    }

    return (
        <>
            <AdminNavbar />
            
            <div className="container mx-auto px-4 py-8">
                {/* Navegación Breadcrumb */}
                <div className="mb-6">
                    <Link 
                        href="/admin/capacitaciones" 
                        className="inline-flex items-center text-gray-500 hover:text-crucianelli-secondary transition-colors mb-4 text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al listado
                    </Link>
                    
                    {/* Tarjeta de Resumen de la Capacitación */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-crucianelli-secondary">
                                    {capacitacion.nombre}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    capacitacion.estado === 'visible' ? 'bg-green-100 text-green-700' :
                                    capacitacion.estado === 'oculto' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {capacitacion.estado}
                                </span>
                            </div>
                            
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                {capacitacion.descripcion || "Sin descripción disponible."}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <MapPin className="w-4 h-4 mr-2 text-crucianelli-primary" />
                                    <span className="capitalize">{capacitacion.modalidad}</span>
                                </div>
                                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                                    <span>{grupos.length} Grupos creados</span>
                                </div>
                            </div>
                        </div>

                        {/* Botón de Acción Principal */}
                        <div className="flex-shrink-0">
                             {/* Formulario para Crear Nuevo Grupo (Modal) */}
                             <GroupForm capacitacionId={capacitacion.id} />
                        </div>
                    </div>
                </div>

                {/* Sección de Gestión de Grupos */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 border-l-4 border-crucianelli-primary pl-3">
                            Grupos y Cronograma
                        </h2>
                    </div>
                    
                    {/* Tabla de Grupos */}
                    <GroupTable grupos={grupos} capacitacionId={capacitacion.id} />
                </div>
            </div>
        </>
    );
}