'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Necesario para refrescar datos en segundo plano
import { Search, Trash2, Check, X, Filter, Loader2, Calendar, UserCheck, UserX } from 'lucide-react';
import { InscripcionAdminRow } from '@/lib/services/inscripcion.service';
import { deleteInscripcionAction, toggleAsistenciaAction } from '@/lib/actions/inscripcion.actions';

interface SimpleItem { id: number; nombre: string; }

interface InscripcionesTableProps {
    initialData: InscripcionAdminRow[];
    concesionarios: SimpleItem[];
    capacitaciones: SimpleItem[];
}

export default function InscripcionesTable({ initialData, concesionarios, capacitaciones }: InscripcionesTableProps) {
    const router = useRouter();
    
    // ESTADO LOCAL: Usamos un estado local inicializado con los datos del servidor
    // Esto es CLAVE para poder actualizar la UI instantáneamente (Optimistic UI)
    const [inscripciones, setInscripciones] = useState<InscripcionAdminRow[]>(initialData);

    // Sincronizar si llegan datos nuevos del servidor (ej: tras un router.refresh)
    useEffect(() => {
        setInscripciones(initialData);
    }, [initialData]);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterConcesionario, setFilterConcesionario] = useState<string>('');
    const [filterCapacitacion, setFilterCapacitacion] = useState<string>('');
    const [isPendingDelete, setIsPendingDelete] = useState(false);

    // Filtrado sobre el estado local
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

    // --- MANEJADOR DE ASISTENCIA (OPTIMISTA) ---
    const handleSetAsistencia = async (id: string, valor: boolean) => {
        // 1. Guardamos el estado anterior por si falla
        const previousState = [...inscripciones];

        // 2. Actualizamos la UI YA MISMO (Feedback instantáneo)
        setInscripciones(current => 
            current.map(row => 
                row.id === id ? { ...row, asistencia_marcada: valor } : row
            )
        );

        try {
            // 3. Llamamos al servidor en segundo plano
            const result = await toggleAsistenciaAction(id, valor);
            if (!result.success) throw new Error(result.message);
            
            // 4. Refrescamos los datos del servidor para asegurar sincronía silenciosa
            router.refresh();
        } catch (error) {
            // 5. Si falla, revertimos el cambio visual y avisamos
            setInscripciones(previousState);
            alert("Error al actualizar la asistencia. Verifica tu conexión.");
        }
    };

    // Manejador de eliminación
    const handleDelete = async (id: string, nombre: string) => {
        if (confirm(`¿Estás seguro de dar de baja a ${nombre}? Se liberará el cupo.`)) {
            setIsPendingDelete(true);
            const result = await deleteInscripcionAction(id);
            if (result.success) {
                // Eliminamos localmente también para feedback instantáneo
                setInscripciones(prev => prev.filter(i => i.id !== id));
                router.refresh();
            } else {
                alert(result.message);
            }
            setIsPendingDelete(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-4">
            
            {/* Filtros (Igual que antes) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {/* Selects de filtros... */}
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                            className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            value={filterCapacitacion}
                            onChange={(e) => setFilterCapacitacion(e.target.value)}
                        >
                            <option value="">Todas las Capacitaciones</option>
                            {capacitaciones.map(c => (
                                <option key={c.id} value={c.nombre}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                            className="pl-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            value={filterConcesionario}
                            onChange={(e) => setFilterConcesionario(e.target.value)}
                        >
                            <option value="">Todos los Concesionarios</option>
                            {concesionarios.map(c => (
                                <option key={c.id} value={c.nombre}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                
                {isPendingDelete && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumno</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso / Grupo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concesionario</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Control de Asistencia</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No se encontraron resultados.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            {formatDate(row.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{row.nombre_inscripto}</div>
                                            <div className="text-xs text-gray-500">{row.email_inscripto}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs font-bold text-gray-700">{row.nombre_capacitacion}</div>
                                            <div className="text-xs text-gray-500">{row.nombre_grupo}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {row.nombre_concesionario}
                                        </td>

                                        {/* --- BOTONES DE ASISTENCIA MEJORADOS --- */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex justify-center items-center gap-2">
                                                
                                                {/* Botón PRESENTE */}
                                                <button
                                                    onClick={() => handleSetAsistencia(row.id, true)}
                                                    className={`
                                                        flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-bold transition-all border
                                                        ${row.asistencia_marcada 
                                                            ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-105' // Estado Activo: Sólido
                                                            : 'bg-white text-gray-400 border-gray-200 hover:border-green-500 hover:text-green-600' // Estado Inactivo
                                                        }
                                                    `}
                                                    title="Marcar Presente"
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Presente
                                                </button>

                                                {/* Botón AUSENTE */}
                                                <button
                                                    onClick={() => handleSetAsistencia(row.id, false)}
                                                    className={`
                                                        flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-bold transition-all border
                                                        ${!row.asistencia_marcada 
                                                            ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-105' // Estado Activo: Sólido
                                                            : 'bg-white text-gray-400 border-gray-200 hover:border-red-500 hover:text-red-600' // Estado Inactivo
                                                        }
                                                    `}
                                                    title="Marcar Ausente"
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Ausente
                                                </button>

                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(row.id, row.nombre_inscripto)}
                                                className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                title="Dar de baja"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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