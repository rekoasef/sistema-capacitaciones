'use client';

import Link from 'next/link'; // Importamos Link
import { Eye } from 'lucide-react'; // Importamos el ícono del Ojo
import { Database } from '@/types/supabase';
import ConcesionarioForm from './ConcesionarioForm';
import DeleteConcesionario from './DeleteConcesionario';

type Concesionario = Database['public']['Tables']['concesionarios']['Row'];

interface ConcesionarioTableProps {
    concesionarios: Concesionario[];
}

export default function ConcesionarioTable({ concesionarios }: ConcesionarioTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre del Concesionario
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {concesionarios.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="px-6 py-10 whitespace-nowrap text-sm text-gray-500 text-center italic">
                                No hay concesionarios registrados.
                            </td>
                        </tr>
                    ) : (
                        concesionarios.map((concesionario) => (
                            <tr key={concesionario.id} className="hover:bg-gray-50 transition-colors">
                                {/* ID */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {concesionario.id}
                                </td>
                                
                                {/* Nombre (También lo hacemos clickeable para mejor UX) */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <Link 
                                        href={`/admin/concesionarios/${concesionario.id}`}
                                        className="hover:text-crucianelli-primary hover:underline"
                                    >
                                        {concesionario.nombre}
                                    </Link>
                                </td>

                                {/* Acciones */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center space-x-2">
                                        
                                        {/* Botón Ver Detalle (NUEVO) */}
                                        <Link 
                                            href={`/admin/concesionarios/${concesionario.id}`}
                                            className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1.5 rounded-md transition-colors"
                                            title="Ver Mecánicos y Detalles"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Link>

                                        {/* Botón Editar */}
                                        <ConcesionarioForm concesionario={concesionario} />
                                        
                                        {/* Botón Eliminar */}
                                        <DeleteConcesionario 
                                            id={concesionario.id} 
                                            name={concesionario.nombre} 
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