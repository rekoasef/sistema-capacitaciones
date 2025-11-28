'use client';

import { Edit, Users, Calendar } from 'lucide-react';
import { CapacitacionRow } from '@/types/capacitacion.types'; // Ruta relativa
import CapacitacionForm from '@/components/admin/capacitaciones/CapacitacionForm';
import DeleteCapacitacion from '@/components/admin/capacitaciones/DeleteCapacitacion';

interface CapacitacionTableProps {
    capacitaciones: CapacitacionRow[];
}

// Componente de tabla (Client Component)
export default function CapacitacionTable({ capacitaciones }: CapacitacionTableProps) {
    
    // Función de actualización simple
    const handleSuccess = () => {
        // La Server Action revalida el path. No se necesita lógica adicional aquí.
    };

    const getEstadoClass = (estado: string) => {
        switch (estado) {
            case 'visible':
                return 'bg-green-100 text-green-800';
            case 'oculto':
                return 'bg-yellow-100 text-yellow-800';
            case 'borrador':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID / Nombre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Detalles
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Modalidad / Estado
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {capacitaciones.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-10 whitespace-nowrap text-sm text-gray-500 text-center italic">
                                No hay capacitaciones registradas. ¡Crea una para comenzar!
                            </td>
                        </tr>
                    ) : (
                        capacitaciones.map((capacitacion) => (
                            <tr key={capacitacion.id} className="hover:bg-gray-50">
                                {/* Columna Nombre/ID */}
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-crucianelli-secondary">
                                        {capacitacion.nombre}
                                    </div>
                                    <div className="text-xs text-gray-500">ID: {capacitacion.id}</div>
                                </td>
                                
                                {/* Columna Detalles */}
                                <td className="px-6 py-4 max-w-xs">
                                    <p className="text-sm text-gray-600 truncate mb-1">
                                        {capacitacion.descripcion}
                                    </p>
                                    <div className="flex items-center space-x-3 mt-1">
                                        <span className="flex items-center text-xs text-gray-500">
                                            <Users className="h-4 w-4 mr-1 text-blue-500" />
                                            {/*@ts-ignore*/}
                                            Cupo Máx: {capacitacion.cupo_maximo}
                                        </span>
                                    </div>
                                </td>

                                {/* Columna Modalidad/Estado */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium capitalize text-gray-800 mb-1">
                                        {capacitacion.modalidad}
                                    </div>
                                    <span 
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getEstadoClass(capacitacion.estado)}`}
                                    >
                                        {capacitacion.estado}
                                    </span>
                                </td>

                                {/* Columna Acciones */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-center space-x-2 items-center">
                                        {/* Botón de Gestión de Grupos (Funcionalidad Futura) */}
                                        <button
                                            title="Gestionar Grupos"
                                            className="text-gray-600 hover:text-crucianelli-secondary transition duration-150 p-1 rounded-md"
                                            onClick={() => alert(`Navegar a la gestión de grupos para Capacitación ID: ${capacitacion.id}`)}
                                        >
                                            <Calendar className="h-5 w-5" />
                                        </button>
                                        
                                        {/* Botón de Editar */}
                                        <CapacitacionForm 
                                            capacitacion={capacitacion} 
                                            onSuccess={handleSuccess} 
                                        />
                                        
                                        {/* Botón de Eliminar */}
                                        <DeleteCapacitacion 
                                            id={capacitacion.id} 
                                            name={capacitacion.nombre} 
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}