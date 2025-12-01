'use client';

import Link from 'next/link'; // <--- IMPORTANTE: Importar Link
import { CapacitacionRow } from '@/types/capacitacion.types'; 
import CapacitacionForm from './CapacitacionForm'; 
import DeleteCapacitacion from './DeleteCapacitacion'; 
import { Calendar } from 'lucide-react'; // <--- Importamos el ícono

const tableHeaders = [
  'Nombre',
  'Descripción',
  'Modalidad',
  'Estado',
  'Acciones',
];

export default function CapacitacionTable({ capacitaciones }: { capacitaciones: CapacitacionRow[] }) {
  
  const getEstadoClass = (estado: CapacitacionRow['estado']) => {
    switch (estado) {
        case 'visible': return 'bg-green-100 text-green-800';
        case 'oculto': return 'bg-yellow-100 text-yellow-800';
        case 'borrador': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 bg-white shadow-xl rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Listado de Capacitaciones</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeaders.map((header) => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {capacitaciones.length === 0 ? ( 
                <tr>
                    <td colSpan={tableHeaders.length} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        No se encontraron capacitaciones.
                    </td>
                </tr>
            ) : (
                capacitaciones.map((cap) => (
                    <tr key={cap.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cap.nombre}</td>
                        
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={cap.descripcion ?? ''}>
                            {cap.descripcion ? cap.descripcion.substring(0, 50) + (cap.descripcion.length > 50 ? '...' : '') : ''} 
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {cap.modalidad}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getEstadoClass(cap.estado)}`}>
                                {cap.estado}
                            </span>
                        </td>
                        
                        {/* --- COLUMNA DE ACCIONES ACTUALIZADA --- */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2 items-center">
                            
                            {/* 1. Botón para Gestionar Grupos (NUEVO) */}
                            <Link 
                                href={`/admin/capacitaciones/${cap.id}`}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md transition-colors"
                                title="Gestionar Grupos y Horarios"
                            >
                                <Calendar className="h-5 w-5" />
                            </Link>

                            {/* 2. Botón Editar */}
                            <CapacitacionForm capacitacion={cap} /> 
                            
                            {/* 3. Botón Eliminar */}
                            <DeleteCapacitacion id={cap.id} name={cap.nombre} />
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