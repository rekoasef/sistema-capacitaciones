// frontend/src/pages/admin/capacitaciones/index.tsx

import { useEffect, useState, useCallback } from 'react'; // 1. Importar useCallback
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiPlus, FiEye, FiTrash2, FiEyeOff } from 'react-icons/fi';
import ConfirmModal from '@/components/ConfirmModal';
import toast from 'react-hot-toast';
import { useApi } from '@/hooks/useApi'; // 2. Importar el hook

interface Capacitacion { 
  id: number; 
  nombre: string; 
  instructor: string; 
  visible: boolean;
}
interface Grupo { 
  id: number; 
  fechaInicio: string; 
  cupoMaximo: number; 
  capacitacionId: number; 
}

export default function GestionCapacitacionesPage() {
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [error, setError] = useState(''); // Estado de error local
  const router = useRouter();
  
  // 3. Usar el hook useApi
  const { request, loading: apiLoading } = useApi();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capacitacionIdParaEliminar, setCapacitacionIdParaEliminar] = useState<number | null>(null);

  // 4. Refactorizar fetchData
  const fetchData = useCallback(async () => {
    setError('');
    try {
      // Usamos Promise.all con el hook para cargar ambos recursos
      const [dataCap, dataGrupos] = await Promise.all([
        request<Capacitacion[]>('/capacitaciones/admin/all', { method: 'GET' }),
        request<Grupo[]>('/grupos', { method: 'GET' }) // El endpoint de grupos es público
      ]);
      
      if (dataCap) setCapacitaciones(dataCap);
      if (dataGrupos) setGrupos(dataGrupos);

    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar los datos.');
      toast.error(err.message || 'No se pudieron cargar los datos.');
    }
  }, [request]); // Depender de 'request' del hook

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 5. Refactorizar handleConfirmDelete
  const handleConfirmDelete = async () => {
    if (!capacitacionIdParaEliminar) return;
    const toastId = toast.loading('Eliminando capacitación...');
    
    try {
      await request(`/capacitaciones/${capacitacionIdParaEliminar}`, {
        method: 'DELETE',
      });
      toast.success('Capacitación eliminada con éxito.', { id: toastId });
      fetchData(); // Recargar datos
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsModalOpen(false);
      setCapacitacionIdParaEliminar(null);
    }
  };

  // 6. Refactorizar handleToggleVisibility
  const handleToggleVisibility = async (id: number, currentVisibility: boolean) => {
    const newVisibility = !currentVisibility;
    const toastId = toast.loading(`Cambiando visibilidad...`);

    try {
      await request(`/capacitaciones/${id}`, {
        method: 'PATCH',
        body: { visible: newVisibility },
      });
      
      toast.success(`Capacitación ${newVisibility ? 'publicada' : 'ocultada'}.`, { id: toastId });
      
      // Actualización optimista local
      setCapacitaciones(prevCaps => 
        prevCaps.map(cap => 
          cap.id === id ? { ...cap, visible: newVisibility } : cap
        )
      );

    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };


  const handleOpenDeleteModal = (id: number) => {
    setCapacitacionIdParaEliminar(id);
    setIsModalOpen(true);
  };

  if (apiLoading && capacitaciones.length === 0) return <div>Cargando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Gestión de Capacitaciones</h1>
        <Link href="/admin/capacitaciones/nueva" className="bg-[#D80027] text-white font-bold py-3 px-5 rounded-lg hover:bg-[#b80021] transition-colors inline-flex items-center shadow-md hover:shadow-lg">
          <FiPlus className="mr-2" />
          Crear Nueva
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capacitaciones.map(cap => (
          <div 
            key={cap.id} 
            className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
              !cap.visible ? 'opacity-60' : ''
            }`}
          >
            {/* Contenido de la Tarjeta */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{cap.nombre}</h2>
              <p className="text-sm text-gray-500 mt-1">Instructor: {cap.instructor}</p>
              
              <div className="mt-2">
                <span 
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    cap.visible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {cap.visible ? 'Publicado' : 'Oculto'}
                </span>
              </div>
            </div>
            
            {/* Grupos (resumen) */}
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold text-gray-600 text-sm">Grupos Programados:</h3>
              <ul className="mt-2 space-y-1">
                {grupos.filter(g => g.capacitacionId === cap.id).length > 0 ? (
                  grupos.filter(g => g.capacitacionId === cap.id).map(grupo => (
                    <li key={grupo.id} className="text-gray-600 text-sm">
                      - {new Date(grupo.fechaInicio).toLocaleDateString('es-AR')} (Cupo: {grupo.cupoMaximo})
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No hay grupos programados.</p>
                )}
              </ul>
            </div>
            
            {/* 7. Botones deshabilitados mientras el hook está 'loading' */}
            <div className="mt-6 flex space-x-2">
               <Link 
                  href={`/admin/capacitaciones/${cap.id}`} 
                  className={`flex-1 text-center bg-[#D80027] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#b80021] transition-colors text-sm inline-flex items-center justify-center ${apiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-disabled={apiLoading}
                  onClick={(e) => { if (apiLoading) e.preventDefault(); }} // Prevenir click si está cargando
                >
                  <FiEye className="mr-2" />
                  Ver Detalles
                </Link>
              <button
                onClick={() => handleToggleVisibility(cap.id, cap.visible)}
                title={cap.visible ? 'Ocultar (Quitar del público)' : 'Publicar (Mostrar al público)'}
                className={`p-2 rounded-lg transition-colors text-sm ${
                  cap.visible 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                disabled={apiLoading}
              >
                {cap.visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
              <button
                onClick={() => handleOpenDeleteModal(cap.id)}
                title="Eliminar permanentemente"
                className="bg-gray-200 text-gray-700 font-semibold p-2 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors text-sm"
                disabled={apiLoading}
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Capacitación?"
        message="¿Estás seguro de que quieres eliminar esta capacitación? Esta acción borrará permanentemente todos sus grupos e inscripciones asociadas. Esta acción no se puede deshacer."
        confirmText="Sí, Eliminar"
      />
    </div>
  );
}