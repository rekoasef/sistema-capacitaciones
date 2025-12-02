'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { Search, Trash2, Check, X, Filter, Loader2, Clock, Users, Sparkles, Calendar, Building2, BookOpen } from 'lucide-react'; 
import { InscripcionAdminRow } from '@/lib/services/inscripcion.service';
import { deleteInscripcionAction, updateAsistenciaAction } from '@/lib/actions/inscripcion.actions';
import DownloadButton from './DownloadButton';
import { toast } from 'sonner';

interface SimpleItem { id: number; nombre: string; }

// FIX: Permitimos que nombre_grupo sea null para coincidir con la definición de BD
interface GrupoItem { id: number; nombre_grupo: string | null; capacitacion_id: number; }

interface InscripcionesTableProps {
    initialData: InscripcionAdminRow[];
    concesionarios: SimpleItem[];
    capacitaciones: SimpleItem[];
    grupos: GrupoItem[]; // Nueva prop
}

export default function InscripcionesTable({ initialData, concesionarios, capacitaciones, grupos }: InscripcionesTableProps) {
    const router = useRouter();
    const [inscripciones, setInscripciones] = useState<InscripcionAdminRow[]>(initialData);

    useEffect(() => {
        setInscripciones(initialData);
    }, [initialData]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterConcesionario, setFilterConcesionario] = useState<string>('');
    const [filterCapacitacion, setFilterCapacitacion] = useState<string>('');
    // Nuevo estado para filtro de grupo
    const [filterGrupo, setFilterGrupo] = useState<string>('');
    const [isPendingDelete, setIsPendingDelete] = useState(false);

    // --- LÓGICA DE FILTRADO DEPENDIENTE ---
    // Calculamos qué grupos mostrar en el combo basándonos en la capacitación seleccionada
    const availableGrupos = useMemo(() => {
        if (!filterCapacitacion) return grupos;
        
        // Buscamos el ID de la capacitación seleccionada (el filtro guarda el NOMBRE)
        const selectedCap = capacitaciones.find(c => c.nombre === filterCapacitacion);
        if (!selectedCap) return grupos;

        // Filtramos solo los grupos que pertenecen a esa capacitación
        return grupos.filter(g => g.capacitacion_id === selectedCap.id);
    }, [grupos, filterCapacitacion, capacitaciones]);

    // Si cambio la capacitación, reseteo el filtro de grupo para evitar inconsistencias
    useEffect(() => {
        setFilterGrupo('');
    }, [filterCapacitacion]);

    const filteredData = useMemo(() => {
        return inscripciones.filter(item => {
            const matchesSearch = 
                item.nombre_inscripto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.email_inscripto.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesConcesionario = filterConcesionario 
                ? item.nombre_concesionario === filterConcesionario 
                : true;

            const matchesCapacitacion = filterCapacitacion
                ? item.nombre_capacitacion === filterCapacitacion
                : true;

            // Nuevo filtro lógico
            const matchesGrupo = filterGrupo
                ? item.nombre_grupo === filterGrupo
                : true;

            return matchesSearch && matchesConcesionario && matchesCapacitacion && matchesGrupo;
        });
    }, [inscripciones, searchTerm, filterConcesionario, filterCapacitacion, filterGrupo]);

    const handleSetAsistencia = async (id: string, nuevoEstado: string) => {
        // Optimistic UI Update
        const previousState = [...inscripciones];
        setInscripciones(current => 
            current.map(row => row.id === id ? { ...row, asistencia_marcada: nuevoEstado } : row)
        );
        
        try {
            const result = await updateAsistenciaAction(id, nuevoEstado);
            if (!result.success) throw new Error(result.message);
            
            toast.success(`Asistencia: ${nuevoEstado.toUpperCase()}`);
            router.refresh();
        } catch (error) {
            setInscripciones(previousState); // Rollback
            toast.error("Error al actualizar asistencia.");
        }
    };

    const handleDelete = async (id: string, nombre: string) => {
        if (confirm(`¿Estás seguro de dar de baja a ${nombre}?`)) {
            setIsPendingDelete(true);
            const toastId = toast.loading("Eliminando inscripción...");
            
            const result = await deleteInscripcionAction(id);
            
            if (result.success) {
                setInscripciones(prev => prev.filter(i => i.id !== id));
                toast.dismiss(toastId);
                toast.success("Inscripción eliminada.");
                router.refresh();
            } else {
                toast.dismiss(toastId);
                toast.error(result.message);
            }
            setIsPendingDelete(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    const isNewMechanic = (createdAt: string | null) => {
        if (!createdAt) return false;
        const created = new Date(createdAt);
        const now = new Date();
        const diffTime = now.getTime() - created.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays <= 7 && diffDays >= 0; 
    };

    const getButtonClass = (estadoActual: string, botonEstado: string, color: string) => {
        const current = estadoActual || 'pendiente';
        const isActive = current === botonEstado;
        const base = "flex items-center justify-center p-2 rounded-md transition-all border";
        
        if (isActive) {
            if (color === 'green') return `${base} bg-green-600 text-white border-green-600 shadow-sm`;
            if (color === 'red') return `${base} bg-red-600 text-white border-red-600 shadow-sm`;
            return `${base} bg-yellow-500 text-white border-yellow-500 shadow-sm`; 
        }
        return `${base} bg-white text-gray-400 border-gray-200 hover:bg-gray-50 hover:text-gray-600`;
    };

    // Componente de controles de asistencia reutilizable
    const AsistenciaControls = ({ row }: { row: InscripcionAdminRow }) => (
        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200 w-full justify-between sm:justify-start sm:w-auto">
            <button onClick={() => handleSetAsistencia(row.id, 'pendiente')} className={`flex-1 sm:flex-none ${getButtonClass(row.asistencia_marcada, 'pendiente', 'yellow')}`} title="Pendiente">
                <Clock className="w-4 h-4" />
            </button>
            <button onClick={() => handleSetAsistencia(row.id, 'presente')} className={`flex-1 sm:flex-none ml-1 ${getButtonClass(row.asistencia_marcada, 'presente', 'green')}`} title="Presente">
                <Check className="w-4 h-4" />
            </button>
            <button onClick={() => handleSetAsistencia(row.id, 'ausente')} className={`flex-1 sm:flex-none ml-1 ${getButtonClass(row.asistencia_marcada, 'ausente', 'red')}`} title="Ausente">
                <X className="w-4 h-4" />
            </button>
        </div>
    );

    return (
        <div className="space-y-4">
            
            {/* Header y Filtros */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center">
                    <div className="p-3 bg-white border border-gray-200 rounded-lg mr-4 shadow-sm hidden sm:block">
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Gestión de Inscripciones</h1>
                        <p className="text-gray-500 text-sm">{filteredData.length} registros visibles.</p>
                    </div>
                </div>
                <DownloadButton data={filteredData} />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-[64px] z-10 md:static">
                <div className="relative w-full md:w-1/4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Buscar alumno..." className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-crucianelli-primary" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto overflow-x-auto">
                    {/* Filtro Capacitación */}
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-crucianelli-primary" value={filterCapacitacion} onChange={(e) => setFilterCapacitacion(e.target.value)}>
                            <option value="">Todas las Capacitaciones</option>
                            {capacitaciones.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                        </select>
                    </div>

                    {/* Filtro Grupo (NUEVO) */}
                    <div className="relative min-w-[180px]">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select 
                            className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-crucianelli-primary disabled:bg-gray-50 disabled:text-gray-400" 
                            value={filterGrupo} 
                            onChange={(e) => setFilterGrupo(e.target.value)}
                            // Deshabilitamos si no hay grupos (o si se quiere obligar a elegir curso primero, descomentar lo siguiente)
                            // disabled={!filterCapacitacion} 
                        >
                            <option value="">Todos los Grupos</option>
                            {availableGrupos.map(g => (
                                // FIX: Manejo de nulos en el value y el label
                                <option key={g.id} value={g.nombre_grupo || ''}>{g.nombre_grupo || 'Sin Nombre'}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro Concesionario */}
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-crucianelli-primary" value={filterConcesionario} onChange={(e) => setFilterConcesionario(e.target.value)}>
                            <option value="">Todos los Concesionarios</option>
                            {concesionarios.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading Overlay Global */}
            {isPendingDelete && <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm"><Loader2 className="w-10 h-10 text-white animate-spin" /></div>}

            {/* --- VISTA DE ESCRITORIO (Tabla Tradicional) --- */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumno</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso / Grupo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concesionario</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencia</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500"><Search className="h-8 w-8 text-gray-300 mb-2 mx-auto" /><p>No se encontraron resultados.</p></td></tr>
                            ) : (
                                filteredData.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{formatDate(row.created_at)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="text-sm font-medium text-gray-900 mr-2">{row.nombre_inscripto}</div>
                                                {isNewMechanic(row.mecanico_created_at) && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">
                                                        <Sparkles className="w-3 h-3 mr-0.5" /> NUEVO
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">{row.email_inscripto}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-xs font-bold text-gray-700">{row.nombre_capacitacion}</div><div className="text-xs text-gray-500">{row.nombre_grupo}</div></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.nombre_concesionario}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <AsistenciaControls row={row} />
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${row.asistencia_marcada === 'presente' ? 'text-green-600' : row.asistencia_marcada === 'ausente' ? 'text-red-600' : 'text-yellow-600'}`}>{row.asistencia_marcada || 'pendiente'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button onClick={() => handleDelete(row.id, row.nombre_inscripto)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- VISTA MÓVIL (Tarjetas Apiladas) --- */}
            <div className="md:hidden space-y-4">
                {filteredData.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                        <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No hay resultados.</p>
                    </div>
                ) : (
                    filteredData.map((row) => (
                        <div key={row.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            
                            {/* Header Tarjeta */}
                            <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900">{row.nombre_inscripto}</h3>
                                        {isNewMechanic(row.mecanico_created_at) && (
                                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">NUEVO</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">{row.email_inscripto}</p>
                                </div>
                                <button 
                                    onClick={() => handleDelete(row.id, row.nombre_inscripto)} 
                                    className="text-gray-400 hover:text-red-500 p-1"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Info Body */}
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex items-start gap-2">
                                    <BookOpen className="w-4 h-4 text-crucianelli-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-800 leading-tight">{row.nombre_capacitacion}</p>
                                        <p className="text-xs text-gray-500">{row.nombre_grupo}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-700 text-xs">{row.nombre_concesionario}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-500 text-xs">{formatDate(row.created_at)}</span>
                                </div>
                            </div>

                            {/* Footer Asistencia */}
                            <div className="bg-gray-50 -mx-4 -mb-4 p-3 flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${row.asistencia_marcada === 'presente' ? 'text-green-600' : row.asistencia_marcada === 'ausente' ? 'text-red-600' : 'text-gray-500'}`}>
                                    {row.asistencia_marcada || 'Pendiente'}
                                </span>
                                <div className="scale-90 origin-right">
                                    <AsistenciaControls row={row} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}