'use client';

import { Users, Calendar, Clock, AlertCircle } from 'lucide-react';
import { GrupoWithDias } from '@/types/grupo.types';
// Estos componentes los crearemos en los siguientes pasos
import DeleteGroup from './DeleteGroup';
import GroupForm from './GroupForm'; 

interface GroupTableProps {
    grupos: GrupoWithDias[];
    capacitacionId: number;
}

export default function GroupTable({ grupos, capacitacionId }: GroupTableProps) {

    // Helper para estilos de estado
    const getEstadoClass = (estado: string) => {
        switch (estado) {
            case 'activo': return 'bg-green-100 text-green-800 border-green-200';
            case 'inactivo': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'lleno': return 'bg-red-100 text-red-800 border-red-200';
            case 'cerrado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    // Helper para formatear fechas (DD/MM/YYYY)
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        // Ajustamos la zona horaria para mostrar la fecha correcta localmente
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC' // Asumimos fechas guardadas en formato ISO/UTC date
        }).format(date);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre del Grupo
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cronograma (Días y Horarios)
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado / Cupo
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {grupos.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Calendar className="h-10 w-10 text-gray-300 mb-2" />
                                        <p>No hay grupos creados para esta capacitación.</p>
                                        <p className="text-xs text-gray-400 mt-1">Utiliza el botón Nuevo Grupo para comenzar.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            grupos.map((grupo) => (
                                <tr key={grupo.id} className="hover:bg-gray-50 transition-colors">
                                    {/* Nombre */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-crucianelli-secondary">
                                            {grupo.nombre_grupo}
                                        </div>
                                        <div className="text-xs text-gray-400">ID: {grupo.id}</div>
                                    </td>

                                    {/* Cronograma (Lista de días) */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-1">
                                            {grupo.dias && grupo.dias.length > 0 ? (
                                                grupo.dias.map((dia) => (
                                                    <div key={dia.id} className="text-sm text-gray-600 flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1.5 text-gray-400" />
                                                        <span className="font-medium mr-2">{formatDate(dia.fecha)}</span>
                                                        <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                                                        <span>{dia.hora_inicio?.slice(0, 5)} - {dia.hora_fin?.slice(0, 5)} hs</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-xs text-red-400 flex items-center">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Sin días asignados
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Estado y Cupo */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getEstadoClass(grupo.estado)}`}>
                                                {grupo.estado}
                                            </span>
                                            <div className="flex items-center text-xs text-gray-500" title="Cupo Máximo">
                                                <Users className="w-3 h-3 mr-1" />
                                                <span className="font-semibold">{grupo.cupo_maximo}</span>
                                                <span className="ml-1">lugares</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            {/* Formulario en modo Edición */}
                                            {/* Nota: Pasamos el grupo completo para pre-cargar datos */}
                                            <GroupForm 
                                                capacitacionId={capacitacionId} 
                                                grupoToEdit={grupo} 
                                            />
                                            
                                            {/* Botón Eliminar */}
                                            <DeleteGroup 
                                                id={grupo.id} 
                                                nombre={grupo.nombre_grupo || 'Grupo'} 
                                                capacitacionId={capacitacionId}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}