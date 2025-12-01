import Link from 'next/link';
import { 
    Users, 
    GraduationCap, 
    Calendar, 
    TrendingUp, 
    ArrowRight, 
    PlusCircle, 
    List 
} from 'lucide-react';
// Importamos el tipo desde el servicio (asegúrate de que el servicio lo exporte)
import { DashboardStats as StatsType } from '@/lib/services/dashboard.service';

interface DashboardStatsProps {
    stats: StatsType;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
    
    // Helper para formatear fechas
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8">
            
            {/* --- SECCIÓN 1: KPIs (Tarjetas de Métricas) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Tarjeta: Total Inscriptos */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 rounded-full bg-blue-50 text-blue-600 mr-4">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Inscriptos</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.totalInscriptos}</h3>
                    </div>
                </div>

                {/* Tarjeta: Capacitaciones Activas */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 rounded-full bg-green-50 text-green-600 mr-4">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Cursos Visibles</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.capacitacionesActivas}</h3>
                    </div>
                </div>

                {/* Tarjeta: Grupos Activos */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 rounded-full bg-purple-50 text-purple-600 mr-4">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Grupos Abiertos</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.gruposActivos}</h3>
                    </div>
                </div>

                {/* Tarjeta: Tasa de Asistencia */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 rounded-full bg-orange-50 text-orange-600 mr-4">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Asistencia</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.tasaAsistencia}%</h3>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN 2: GRID DE CONTENIDO PRINCIPAL --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLUMNA IZQUIERDA (2/3): Actividad Reciente */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">Últimas Inscripciones</h3>
                        <Link href="/admin/inscripciones" className="text-sm text-crucianelli-secondary hover:text-crucianelli-primary font-medium flex items-center">
                            Ver todas <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumno</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso / Grupo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concesionario</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats.ultimasInscripciones.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm italic">
                                            No hay actividad reciente.
                                        </td>
                                    </tr>
                                ) : (
                                    stats.ultimasInscripciones.map((insc) => (
                                        <tr key={insc.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                {formatDate(insc.fecha)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {insc.alumno}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs font-semibold text-gray-700">{insc.curso}</div>
                                                <div className="text-xs text-gray-500">{insc.grupo}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {insc.concesionario}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* COLUMNA DERECHA (1/3): Accesos Rápidos */}
                <div className="space-y-6">
                    
                    {/* Panel de Accesos Rápidos */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Gestión Rápida</h3>
                        <div className="space-y-3">
                            <Link 
                                href="/admin/capacitaciones" 
                                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-crucianelli-primary hover:bg-red-50 transition-all group"
                            >
                                <div className="bg-red-100 p-2 rounded-md text-crucianelli-primary group-hover:bg-red-200 transition-colors">
                                    <PlusCircle className="w-5 h-5" />
                                </div>
                                <span className="ml-3 font-medium text-gray-700 group-hover:text-crucianelli-primary">Nueva Capacitación</span>
                            </Link>

                            <Link 
                                href="/admin/inscripciones" 
                                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                                <div className="bg-blue-100 p-2 rounded-md text-blue-600 group-hover:bg-blue-200 transition-colors">
                                    <List className="w-5 h-5" />
                                </div>
                                <span className="ml-3 font-medium text-gray-700 group-hover:text-blue-700">Gestionar Asistencias</span>
                            </Link>

                            <Link 
                                href="/admin/concesionarios" 
                                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group"
                            >
                                <div className="bg-gray-100 p-2 rounded-md text-gray-600 group-hover:bg-gray-200 transition-colors">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span className="ml-3 font-medium text-gray-700 group-hover:text-gray-900">Ver Concesionarios</span>
                            </Link>
                        </div>
                    </div>

                    {/* Tip del día o Estado del Sistema */}
                    <div className="bg-gradient-to-br from-crucianelli-secondary to-gray-800 p-6 rounded-xl shadow-md text-white">
                        <h4 className="font-bold text-lg mb-2">💡 Tip de Administración</h4>
                        <p className="text-sm text-gray-200 opacity-90">
                            Recuerda cerrar los grupos que ya hayan finalizado para mantener el catálogo público actualizado y ordenado.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}