'use client';

import { MecanicoRow } from '@/types/mecanico.types';
import { Wrench, Award, User } from 'lucide-react';
import MecanicoForm from './MecanicoForm';
import DeleteMecanico from './DeleteMecanico';

interface MecanicoTableProps {
    mecanicos: MecanicoRow[];
    concesionarioId: number;
}

export default function MecanicoTable({ mecanicos, concesionarioId }: MecanicoTableProps) {

    // Helper para los colores según el nivel de experiencia
    const getNivelBadge = (nivel: string) => {
        switch (nivel) {
            case 'Avanzado': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Basico': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Junior': 
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre y Apellido
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rol / Puesto
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nivel Técnico
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mecanicos.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Wrench className="h-10 w-10 text-gray-300 mb-2" />
                                        <p>No hay mecánicos registrados en este concesionario.</p>
                                        <p className="text-xs text-gray-400 mt-1">Agrega el primero usando el botón superior.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            mecanicos.map((mecanico) => (
                                <tr key={mecanico.id} className="hover:bg-gray-50 transition-colors">
                                    {/* Nombre */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {mecanico.nombre} {mecanico.apellido}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Rol */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {mecanico.rol || 'Mecánico'}
                                    </td>

                                    {/* Nivel (Badge) */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getNivelBadge(mecanico.nivel)}`}>
                                            <Award className="w-3 h-3 mr-1" />
                                            {mecanico.nivel}
                                        </span>
                                    </td>

                                    {/* Acciones - AQUÍ ESTÁ EL CAMBIO IMPORTANTE */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center space-x-2">
                                            
                                            {/* 1. Botón Editar (Lápiz) */}
                                            {/* Al pasar 'mecanicoToEdit', el componente MecanicoForm renderiza el lápiz automáticamente */}
                                            <MecanicoForm 
                                                concesionarioId={concesionarioId}
                                                mecanicoToEdit={mecanico} 
                                            />
                                            
                                            {/* 2. Botón Eliminar (Tacho) */}
                                            <DeleteMecanico 
                                                id={mecanico.id} 
                                                nombre={`${mecanico.nombre} ${mecanico.apellido}`}
                                                concesionarioId={concesionarioId}
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