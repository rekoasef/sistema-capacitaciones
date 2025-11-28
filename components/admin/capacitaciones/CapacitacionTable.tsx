import { CapacitacionRow } from '@/types/capacitacion.types'; 
import CapacitacionForm from './CapacitacionForm'; 
import DeleteCapacitacion from './DeleteCapacitacion'; 
import { AlertTriangle } from 'lucide-react'; 

// Definición de la estructura de la tabla (FIX: Eliminado 'Cupo Máximo')
const tableHeaders = [
  'Nombre',
  'Descripción',
  'Modalidad',
  'Estado',
  'Acciones',
];

// CRÍTICO: Este componente es un COMPONENTE DE VISTA simple (Server Component)
export default function CapacitacionTable({ capacitaciones }: { capacitaciones: CapacitacionRow[] }) {
  
  // Función helper para los estilos del badge (FIX: Alineación de estados)
  const getEstadoClass = (estado: CapacitacionRow['estado']) => {
    switch (estado) {
        case 'visible':
            return 'bg-green-100 text-green-800';
        case 'oculto':
            return 'bg-yellow-100 text-yellow-800';
        case 'borrador':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800'; // Default seguro
    }
  };


  return (
    <div className="p-4 bg-white shadow-xl rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Listado de Capacitaciones</h2>
        {/* Botón de Nueva Capacitación (CapacitacionForm en modo creación) */}
        {/* FIX CRÍTICO: ELIMINAMOS ESTA LÍNEA DE BOTÓN DUPLICADO
        <CapacitacionForm /> 
        */}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* FIX DE ERROR: capacitaciones está garantizado a ser un array por el check en page.tsx */}
            {capacitaciones.length === 0 ? ( 
                <tr>
                    <td colSpan={tableHeaders.length} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        No se encontraron capacitaciones.
                    </td>
                </tr>
            ) : (
                capacitaciones.map((cap) => (
                    <tr key={cap.id} className="hover:bg-gray-50">
                        {/* Nombre */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cap.nombre}</td>
                        
                        {/* Descripción (Truncada para la vista de tabla) */}
                        {/* FIX: Usamos el operador de fusión nula (??) para asegurar que title sea string */}
                        <td 
                            className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" 
                            title={cap.descripcion ?? ''} 
                        >
                            {cap.descripcion ? cap.descripcion.substring(0, 50) + (cap.descripcion.length > 50 ? '...' : '') : ''} 
                        </td>
                        
                        {/* Modalidad */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cap.modalidad?.charAt(0).toUpperCase() + cap.modalidad?.slice(1)}
                        </td>
                        
                        {/* Estado (Usando un badge condicional) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getEstadoClass(cap.estado)}`}
                            >
                                {cap.estado.charAt(0).toUpperCase() + cap.estado.slice(1)}
                            </span>
                        </td>
                        
                        {/* Acciones (Editar y Eliminar) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2 items-center">
                            {/* Botón de Edición (CapacitacionForm en modo edición) */}
                            {/* FIX CRÍTICO: No pasamos onSuccess para edición tampoco */}
                            <CapacitacionForm capacitacion={cap} /> 
                            
                            {/* Botón de Eliminación (DeleteCapacitacion) */}
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