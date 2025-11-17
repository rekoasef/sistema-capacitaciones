// frontend/src/pages/admin/concesionarios/index.tsx

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '@/components/ConfirmModal';
import EditModal from '@/components/EditModal';
import { useApi } from '@/hooks/useApi'; // <-- 1. IMPORTAR EL HOOK

interface Concesionario {
  id: number;
  nombre: string;
}

export default function GestionConcesionariosPage() {
  const [concesionarios, setConcesionarios] = useState<Concesionario[]>([]);
  // 2. USAR EL ESTADO DE LOADING DEL HOOK
  const { request, loading: apiLoading } = useApi(); 
  
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [concesionarioActual, setConcesionarioActual] = useState<Concesionario | null>(null);

  // --- Cargar Datos (Refactorizado) ---
  const fetchData = async () => {
    try {
      // 3. Lógica de fetch súper simple
      const data = await request<Concesionario[]>('/concesionarios', { method: 'GET' });
      if (data) {
        setConcesionarios(data);
      }
    } catch (err: any) {
      toast.error(`Error al cargar: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // El hook 'request' está memoizado con useCallback, es seguro

  // --- Lógica de Creación (Refactorizada) ---
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Creando concesionario...');
    
    try {
      // 4. Lógica de POST simple
      await request('/concesionarios', {
        method: 'POST',
        body: { nombre: nuevoNombre },
      });
      toast.success('Concesionario creado.', { id: toastId });
      setNuevoNombre('');
      fetchData(); // Recargar la lista
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  // --- Lógica de Edición (Refactorizada) ---
  const openEditModal = (concesionario: Concesionario) => {
    setConcesionarioActual(concesionario);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (updatedName: string) => {
    if (!concesionarioActual) return;
    const toastId = toast.loading('Actualizando...');

    try {
      // 5. Lógica de PATCH simple
      await request(`/concesionarios/${concesionarioActual.id}`, {
        method: 'PATCH',
        body: { nombre: updatedName },
      });
      toast.success('Concesionario actualizado.', { id: toastId });
      setIsEditModalOpen(false);
      setConcesionarioActual(null);
      fetchData(); // Recargar la lista
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  // --- Lógica de Eliminación (Refactorizada) ---
  const openDeleteModal = (concesionario: Concesionario) => {
    setConcesionarioActual(concesionario);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!concesionarioActual) return;
    const toastId = toast.loading('Eliminando...');

    try {
      // 6. Lógica de DELETE simple
      await request(`/concesionarios/${concesionarioActual.id}`, {
        method: 'DELETE',
      });
      toast.success('Concesionario eliminado.', { id: toastId });
      setIsDeleteModalOpen(false);
      setConcesionarioActual(null);
      fetchData(); // Recargar la lista
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };


  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Gestión de Concesionarios</h1>

      {/* --- Formulario de Creación --- */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Añadir Nuevo Concesionario</h2>
        <form onSubmit={handleCreate} className="flex space-x-4">
          <input
            type="text"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Nombre del concesionario"
            className="flex-1 px-4 py-3 text-gray-900 border border-gray-300 rounded-lg"
            required
            disabled={apiLoading} // 7. Deshabilitar inputs si el hook está cargando
          />
          <button
            type="submit"
            className="bg-[#D80027] text-white font-bold py-3 px-5 rounded-lg hover:bg-[#b80021] transition-colors inline-flex items-center"
            disabled={apiLoading} // 7. Deshabilitar botón
          >
            {apiLoading ? 'Cargando...' : <><FiPlus className="mr-2" />Crear</>}
          </button>
        </form>
      </div>

      {/* --- Tabla de Concesionarios --- */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Concesionarios ({concesionarios.length})</h2>
        <div className="overflow-x-auto">
          {apiLoading && concesionarios.length === 0 && <p>Cargando...</p>}
          {!apiLoading && (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {concesionarios.map(con => (
                  <tr key={con.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link 
                        href={`/admin/concesionarios/${con.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                        title="Ver reporte detallado"
                      >
                        {con.nombre}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(con)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                        title="Editar"
                        disabled={apiLoading} // 7. Deshabilitar
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => openDeleteModal(con)}
                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                        title="Eliminar"
                        disabled={apiLoading} // 7. Deshabilitar
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!apiLoading && concesionarios.length === 0 && <p className="text-center py-4 text-gray-500">No hay concesionarios creados.</p>}
        </div>
      </div>

      {/* --- Modales --- */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Concesionario?"
        message={`¿Estás seguro de que quieres eliminar "${concesionarioActual?.nombre}"? Esta acción no se puede deshacer. (No funcionará si tiene inscripciones asociadas).`}
        confirmText="Sí, Eliminar"
      />
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialName={concesionarioActual?.nombre || ''}
        title="Editar Concesionario"
        label="Nombre del concesionario"
      />
    </div>
  );
}