// frontend/src/pages/admin/capacitaciones/[id].tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiDownload, FiEdit, FiCheckSquare, FiUserMinus, FiTrash2, FiXSquare } from 'react-icons/fi';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import nookies from 'nookies';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import { useApi } from '@/hooks/useApi'; // <-- 1. IMPORTAR EL HOOK

// --- ¡AQUÍ ESTÁ EL CAMBIO! ---
// 2. Definimos la URL base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- Interfaces (se mantienen igual) ---
interface Grupo { id: number; fechaInicio: string; fechaFin: string; cupoMaximo: number; }
interface Capacitacion { id: number; nombre: string; instructor: string; grupos: Grupo[]; }
interface Inscripcion { 
  id: number; 
  nombreUsuario: string; 
  emailUsuario: string; 
  telefono: string | null; 
  estado: string; 
  concesionario: { nombre: string } | null; 
}
type PageProps = { capacitacion: Capacitacion | null; inscriptos: Inscripcion[]; error?: string; };

export default function DetalleCapacitacionPage({ capacitacion, inscriptos: initialInscriptos, error: initialError }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  
  const [error, setError] = useState(initialError || '');
  const router = useRouter();
  const { id } = router.query;

  // 3. Usar el hook useApi (para las acciones de estado y borrado)
  const { request, loading: apiLoading } = useApi();

  const [inscriptos, setInscriptos] = useState(initialInscriptos || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inscripcionParaEliminar, setInscripcionParaEliminar] = useState<number | null>(null);

  useEffect(() => {
    setInscriptos(initialInscriptos || []);
  }, [initialInscriptos]);

  // --- handleExport (MODIFICADO) ---
  // (Usamos fetch simple porque esperamos un 'blob', no JSON que 'useApi' maneja)
  const handleExport = async () => {
    const token = localStorage.getItem('token'); 
    if (!token) return router.push('/admin/login');
    setError('');
    try {
        // 4. Usamos la variable API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/capacitaciones/${id}/exportar/csv`, {
            headers: { Authorization: `Bearer ${token}` }
        });
         if (response.status === 401) {
             // El hook useApi haría esto automáticamente, pero aquí lo hacemos manual
             localStorage.removeItem('token');
             nookies.destroy(null, 'token', { path: '/' }); 
             return router.push('/admin/login');
        }
        if (!response.ok) throw new Error('Error al exportar');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inscriptos_${capacitacion?.nombre.replace(/\s+/g, '_')}_${id}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err: any) {
        setError(err.message || 'No se pudo generar el archivo CSV.');
    }
  };

  // --- handleChangeEstado (REFACTORIZADO CON HOOK) ---
  const handleChangeEstado = async (inscripcionId: number, nuevoEstado: 'ASISTIÓ' | 'AUSENTE' | 'PENDIENTE') => {
    const toastId = toast.loading(`Cambiando estado a ${nuevoEstado}...`);
    try {
      // 5. Usamos el hook
      await request(`/inscripciones/${inscripcionId}`, {
        method: 'PATCH',
        body: { estado: nuevoEstado },
      });
      toast.success('Estado actualizado', { id: toastId });
      
      setInscriptos(prevInscripciones => 
        prevInscripciones.map(insc => 
          insc.id === inscripcionId ? { ...insc, estado: nuevoEstado } : insc
        )
      );
    } catch (err: any) {
      // El hook ya maneja el 401, solo mostramos el error
      toast.error(err.message, { id: toastId });
    }
  };
  
  const openDeleteModal = (id: number) => {
    setInscripcionParaEliminar(id);
    setIsModalOpen(true);
  };

  // --- handleDeleteInscripcion (REFACTORIZADO CON HOOK) ---
  const handleDeleteInscripcion = async () => {
    if (!inscripcionParaEliminar) return;
    const toastId = toast.loading('Dando de baja al inscripto...');
    try {
      // 6. Usamos el hook
      await request(`/inscripciones/${inscripcionParaEliminar}`, {
        method: 'DELETE',
      });
      toast.success('Inscripción eliminada', { id: toastId });
      
      setInscriptos(prevInscripciones => 
        prevInscripciones.filter(insc => insc.id !== inscripcionParaEliminar)
      );
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsModalOpen(false);
      setInscripcionParaEliminar(null);
    }
  };


  if (error) return <div className="p-4 text-red-500 bg-red-100 rounded-lg">{error}</div>;
  if (!capacitacion) return <div className="p-4">Cargando...</div>;

  return (
    <div>
      {/* --- Header (MODIFICADO) --- */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <Link href="/admin/capacitaciones" className="text-sm text-blue-600 hover:underline mb-2 block">
            &larr; Volver a Gestión
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">{capacitacion.nombre}</h1>
            <p className="text-lg text-gray-600 mt-1">Instructor: {capacitacion.instructor}</p>
        </div>
        {/* 7. Deshabilitar botones si el hook está ocupado */}
        <div className="flex space-x-2">
            <Link 
              href={`/admin/capacitaciones/${id}/edit`}
              className={`bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center ${apiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-disabled={apiLoading}
              onClick={(e) => { if (apiLoading) e.preventDefault(); }}
            >
                <FiEdit className="mr-2" />
                Editar
            </Link>
            <button 
              onClick={handleExport}
              className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              disabled={apiLoading} // 7. Deshabilitar
            >
                <FiDownload className="mr-2" />
                Exportar (CSV)
            </button>
        </div>
      </div>
      
      {/* --- Sección de Grupos (sin cambios) --- */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Grupos Programados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capacitacion.grupos.length > 0 ? capacitacion.grupos.map(grupo => (
            <div key={grupo.id} className="p-4 border rounded-lg bg-gray-50">
              <p><strong>Fecha Inicio:</strong> {new Date(grupo.fechaInicio).toLocaleString('es-AR')}</p>
              <p><strong>Fecha Fin:</strong> {new Date(grupo.fechaFin).toLocaleString('es-AR')}</p>
              <p><strong>Cupo Máximo:</strong> {grupo.cupoMaximo}</p>
            </div>
          )) : (
            <p className="text-gray-500 col-span-full">No hay grupos programados para esta capacitación.</p>
          )}
        </div>
      </div>

      {/* --- Tabla de Inscriptos (MODIFICADA) --- */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Inscriptos ({inscriptos.length})</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concesionario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {inscriptos.map(inscripto => {
                      const estadoStyles = {
                        'PENDIENTE': 'bg-yellow-100 text-yellow-800',
                        'ASISTIÓ': 'bg-green-100 text-green-800',
                        'AUSENTE': 'bg-red-100 text-red-800',
                      };
                      const estadoStyle = estadoStyles[inscripto.estado as keyof typeof estadoStyles] || estadoStyles['PENDIENTE'];
                      return (
                        <tr key={inscripto.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inscripto.nombreUsuario}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inscripto.emailUsuario}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inscripto.telefono || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inscripto.concesionario?.nombre || 'N/A'}</td> 
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoStyle}`}>
                                {inscripto.estado}
                              </span>
                            </td>
                            {/* 7. Deshabilitar botones si el hook está ocupado */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              {inscripto.estado !== 'ASISTIÓ' && (
                                <button 
                                  onClick={() => handleChangeEstado(inscripto.id, 'ASISTIÓ')}
                                  title="Marcar Asistencia"
                                  className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                                  disabled={apiLoading}
                                >
                                  <FiCheckSquare />
                                </button>
                              )}
                              {inscripto.estado !== 'AUSENTE' && (
                                <button 
                                  onClick={() => handleChangeEstado(inscripto.id, 'AUSENTE')}
                                  title="Marcar Ausencia"
                                  className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                                  disabled={apiLoading}
                                >
                                  <FiXSquare />
                                </button>
                              )}
                              {inscripto.estado !== 'PENDIENTE' && (
                                <button 
                                  onClick={() => handleChangeEstado(inscripto.id, 'PENDIENTE')}
                                  title="Marcar como Pendiente"
                                  className="p-2 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                  disabled={apiLoading}
                                >
                                  <FiUserMinus />
                                </button>
                              )}
                              <button 
                                onClick={() => openDeleteModal(inscripto.id)}
                                title="Dar de Baja (Eliminar)"
                                className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                                disabled={apiLoading}
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                        </tr>
                      );
                    })}
                </tbody>
            </table>
            {inscriptos.length === 0 && <p className="text-center py-4 text-gray-500">No hay inscriptos en esta capacitación.</p>}
        </div>
      </div>

      {/* --- Modal (sin cambios) --- */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteInscripcion}
        title="¿Dar de baja al Inscripto?"
        message="¿Estás seguro de que quieres eliminar esta inscripción? Esta acción no se puede deshacer."
        confirmText="Sí, Dar de Baja"
      />
    </div>
  );
}

// --- getServerSideProps (MODIFICADO) ---
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const cookies = nookies.get(context);
  const token = cookies.token;
  if (!token) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  const { id } = context.params!;
  try {
    // 8. Usamos la variable API_BASE_URL
    const [resCap, resIns] = await Promise.all([
        fetch(`${API_BASE_URL}/capacitaciones/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/capacitaciones/${id}/inscriptos`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (resCap.status === 401 || resIns.status === 401) {
        nookies.destroy(context, 'token', { path: '/' });
        return { redirect: { destination: '/admin/login', permanent: false } };
    }
    if (resCap.status === 404) {
      return { notFound: true };
    }
    if (!resCap.ok) { return { props: { capacitacion: null, inscriptos: [], error: `Error ${resCap.status} al cargar.` } }; }
    if (!resIns.ok) { return { props: { capacitacion: await resCap.json(), inscriptos: [], error: `Error ${resIns.status} al cargar.` } }; }
    
    const dataCap = await resCap.json();
    const dataInscriptos = await resIns.json();
    
    return { props: { capacitacion: dataCap, inscriptos: dataInscriptos } };
  } catch (err: any) {
    console.error(`SSR DEBUG: Error fetching data in admin/[id].tsx for ID ${id}:`, err);
    return { props: { capacitacion: null, inscriptos: [], error: 'No se pudo conectar.' } };
  }
};