'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { Search, Trash2, Check, X, Filter, Loader2, Clock, Users, Sparkles } from 'lucide-react'; 
import { InscripcionAdminRow } from '@/lib/services/inscripcion.service';
import { deleteInscripcionAction, updateAsistenciaAction } from '@/lib/actions/inscripcion.actions';
import DownloadButton from './DownloadButton';

interface SimpleItem { id: number; nombre: string; }

interface InscripcionesTableProps {
    initialData: InscripcionAdminRow[];
    concesionarios: SimpleItem[];
    capacitaciones: SimpleItem[];
}

export default function InscripcionesTable({ initialData, concesionarios, capacitaciones }: InscripcionesTableProps) {
    const router = useRouter();
    const [inscripciones, setInscripciones] = useState<InscripcionAdminRow[]>(initialData);

    useEffect(() => {
        setInscripciones(initialData);
    }, [initialData]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterConcesionario, setFilterConcesionario] = useState<string>('');
    const [filterCapacitacion, setFilterCapacitacion] = useState<string>('');
    const [isPendingDelete, setIsPendingDelete] = useState(false);

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

            return matchesSearch && matchesConcesionario && matchesCapacitacion;
        });
    }, [inscripciones, searchTerm, filterConcesionario, filterCapacitacion]);

    const handleSetAsistencia = async (id: string, nuevoEstado: string) => {
        const previousState = [...inscripciones];
        setInscripciones(current => 
            current.map(row => row.id === id ? { ...row, asistencia_marcada: nuevoEstado } : row)
        );
        try {
            const result = await updateAsistenciaAction(id, nuevoEstado);
            if (!result.success) throw new Error(result.message);
            router.refresh();
        } catch (error) {
            setInscripciones(previousState);
            alert("Error al actualizar asistencia.");
        }
    };

    const handleDelete = async (id: string, nombre: string) => {
        if (confirm(`¿Estás seguro de dar de baja a ${nombre}?`)) {
            setIsPendingDelete(true);
            const result = await deleteInscripcionAction(id);
            if (result.success) {
                setInscripciones(prev => prev.filter(i => i.id !== id));
                router.refresh();
            } else {
                alert(result.message);
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

    // --- FUNCIÓN CORREGIDA PARA DETECTAR NUEVOS ---
    const isNewMechanic = (createdAt: string | null) => {
        if (!createdAt) return false;
        const created = new Date(createdAt);
        const now = new Date();
        // Diferencia en milisegundos
        const diffTime = now.getTime() - created.getTime();
        // Diferencia en días
        const diffDays = diffTime / (1000 * 3600 * 24);
        
        // Si tiene menos de 7 días, es NUEVO
        return diffDays <= 7 && diffDays >= 0; 
    };

    const getButtonClass = (estadoActual: string, botonEstado: string, color: string) => {
        const current = estadoActual || 'pendiente';
        const isActive = current === botonEstado;
        const base = "flex items-center justify-center p-1.5 rounded-md transition-all border";
        if (isActive) {
            if (color === 'green') return `${base} bg-green-600 text-white border-green-600 shadow-md transform scale-105`;
            if (color === 'red') return `${base} bg-red-600 text-white border-red-600 shadow-md transform scale-105`;
            return `${base} bg-yellow-500 text-white border-yellow-500 shadow-md transform scale-105`; 
        }
        return `${base} bg-white text-gray-400 border-gray-200 hover:bg-gray-50 opacity-60 hover:opacity-100`;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center">
                    <div className="p-3 bg-white border border-gray-200 rounded-lg mr-4 shadow-sm">
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Gestión de Inscripciones</h1>
                        <p className="text-gray-500 text-sm">{filteredData.length} registros visibles.</p>
                    </div>
                </div>
                <DownloadButton data={filteredData} />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Buscar..." className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-crucianelli-primary" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none" value={filterCapacitacion} onChange={(e) => setFilterCapacitacion(e.target.value)}>
                            <option value="">Todas las Capacitaciones</option>
                            {capacitaciones.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                        </select>
                    </div>
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none" value={filterConcesionario} onChange={(e) => setFilterConcesionario(e.target.value)}>
                            <option value="">Todos los Concesionarios</option>
                            {concesionarios.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
                {isPendingDelete && <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-sm"><Loader2 className="w-8 h-8 text-crucianelli-primary animate-spin" /></div>}
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
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500" suppressHydrationWarning>{formatDate(row.created_at)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="text-sm font-medium text-gray-900 mr-2">{row.nombre_inscripto}</div>
                                                
                                                {/* --- BADGE "NUEVO" EN ROJO --- */}
                                                {isNewMechanic(row.mecanico_created_at) && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 animate-pulse">
                                                        <Sparkles className="w-3 h-3 mr-0.5" /> NUEVO
                                                    </span>
                                                )}
                                                
                                            </div>
                                            <div className="text-xs text-gray-500">{row.email_inscripto}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-xs font-bold text-gray-700">{row.nombre_capacitacion}</div><div className="text-xs text-gray-500">{row.nombre_grupo}</div></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.nombre_concesionario}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                                    <button onClick={() => handleSetAsistencia(row.id, 'pendiente')} className={getButtonClass(row.asistencia_marcada, 'pendiente', 'yellow')} title="Pendiente"><Clock className="w-4 h-4" /></button>
                                                    <button onClick={() => handleSetAsistencia(row.id, 'presente')} className={`ml-1 ${getButtonClass(row.asistencia_marcada, 'presente', 'green')}`} title="Presente"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => handleSetAsistencia(row.id, 'ausente')} className={`ml-1 ${getButtonClass(row.asistencia_marcada, 'ausente', 'red')}`} title="Ausente"><X className="w-4 h-4" /></button>
                                                </div>
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
        </div>
    );
}