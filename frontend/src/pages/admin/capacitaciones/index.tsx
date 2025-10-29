// frontend/src/pages/admin/capacitaciones/index.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiPlus, FiEye, FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '@/components/ConfirmModal';
import toast from 'react-hot-toast';

// ... (Las interfaces se mantienen igual)
interface Capacitacion { id: number; nombre: string; instructor: string; }
interface Grupo { id: number; fechaInicio: string; cupoMaximo: number; capacitacionId: number; }

export default function GestionCapacitacionesPage() {
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capacitacionIdParaEliminar, setCapacitacionIdParaEliminar] = useState<number | null>(null);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/admin/login');
    try {
      setLoading(true);
      const [resCap, resGrupos] = await Promise.all([
        fetch('http://127.0.0.1:3001/capacitaciones', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://127.0.0.1:3001/grupos'), 
      ]);
      if (resCap.status === 401) return router.push('/admin/login');
      const dataCap = await resCap.json();
      const dataGrupos = await resGrupos.json();
      setCapacitaciones(dataCap);
      setGrupos(dataGrupos);
    } catch (err) {
      setError('No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmDelete = async () => {
    if (!capacitacionIdParaEliminar) return;
    const token = localStorage.getItem('token');
    const toastId = toast.loading('Eliminando capacitación...');
    try {
      const res = await fetch(`http://127.0.0.1:3001/capacitaciones/${capacitacionIdParaEliminar}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo eliminar la capacitación.');
      toast.success('Capacitación eliminada con éxito.', { id: toastId });
      fetchData();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsModalOpen(false);
      setCapacitacionIdParaEliminar(null);
    }
  };

  const handleOpenDeleteModal = (id: number) => {
    setCapacitacionIdParaEliminar(id);
    setIsModalOpen(true);
  };

  if (loading) return <div>Cargando...</div>;
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
          // --- TARJETA REFINADA ---
          <div 
            key={cap.id} 
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Contenido de la Tarjeta */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{cap.nombre}</h2>
              <p className="text-sm text-gray-500 mt-1">Instructor: {cap.instructor}</p>
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
            
            {/* Botones de Acción (Refinados) */}
            <div className="mt-6 flex space-x-2">
               <Link 
                  href={`/admin/capacitaciones/${cap.id}`} 
                  className="flex-1 text-center bg-[#D80027] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#b80021] transition-colors text-sm inline-flex items-center justify-center"
                >
                  <FiEye className="mr-2" />
                  Ver Detalles
                </Link>
              <button
                onClick={() => handleOpenDeleteModal(cap.id)}
                className="bg-gray-200 text-gray-700 font-semibold p-2 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors text-sm"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

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