// frontend/src/pages/admin/capacitaciones/[id].tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiDownload, FiEdit, FiCheckSquare, FiUserMinus, FiTrash2, FiXSquare, FiCalendar, FiUsers, FiEdit2 } from 'react-icons/fi';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import nookies from 'nookies';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import { useApi } from '@/hooks/useApi'; 

// --- ¡AQUÍ ESTÁ EL CAMBIO! ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- Interfaces (Actualizadas para R1, R6, R3) ---
interface Grupo { 
  id: number; 
  fechaInicio: string; 
  fechaFin: string; // R1
  cupoMaximo: number; 
  inscripcionesCount: number; // R3/6.1
}

interface Capacitacion { 
  id: number; 
  nombre: string; 
  instructor: string; 
  modalidad: string; 
  ubicacion: string; // R6
  grupos: Grupo[]; 
  visible: boolean;
}

interface Inscripcion { 
  id: number; 
  nombreUsuario: string; 
  emailUsuario: string; 
  telefono: string | null; 
  estado: string; 
  concesionario: { nombre: string } | null; 
}

type PageProps = { 
  capacitacion: Capacitacion | null; 
  inscriptos: Inscripcion[]; // Se mantiene por la función de exportar todo
  error?: string; 
};


// --- HELPER FUNCTION (R3) ---
const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    // Se asume que el backend devuelve un ISOString, por lo que convertimos a fecha local legible.
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    return `${date.toLocaleDateString('es-AR', dateOptions)} ${date.toLocaleTimeString('es-AR', timeOptions)}`;
};


export default function DetalleCapacitacionPage({ capacitacion: initialCapacitacion, inscriptos: initialInscriptos, error: initialError }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  
  const [error, setError] = useState(initialError || '');
  const router = useRouter();
  const { id } = router.query;

  const { request, loading: apiLoading } = useApi();

  const [capacitacionData, setCapacitacionData] = useState(initialCapacitacion);
  const [inscriptos, setInscriptos] = useState(initialInscriptos || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inscripcionParaEliminar, setInscripcionParaEliminar] = useState<number | null>(null);

  // Update local state when initial props change (e.g., after successful action)
  useEffect(() => {
    setInscriptos(initialInscriptos || []);
    setCapacitacionData(initialCapacitacion);
  }, [initialInscriptos, initialCapacitacion]);


  // --- handleExport (MODIFICADO) ---
  const handleExport = async () => {
    const token = localStorage.getItem('token'); 
    if (!token) return router.push('/admin/login');
    setError('');
    try {
        // NOTE: This endpoint still exports ALL inscriptos for the CAPACITACION, not just a group.
        const response = await fetch(`${API_BASE_URL}/api/capacitaciones/${id}/exportar/csv`, { 
            headers: { Authorization: `Bearer ${token}` }
        });
         if (response.status === 401) {
             localStorage.removeItem('token');
             nookies.destroy(null, 'token', { path: '/' }); 
             return router.push('/admin/login');
        }
        if (!response.ok) throw new Error('Error al exportar');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inscriptos_${capacitacionData?.nombre.replace(/\s+/g, '_')}_${id}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err: any) {
        setError(err.message || 'No se pudo generar el archivo CSV.');
    }
  };

  // --- Placeholder methods from the original file (will be moved to /admin/grupos/:id/inscriptos.tsx in a later phase) ---
  const handleChangeEstado = async (inscripcionId: number, nuevoEstado: 'ASISTIÓ' | 'AUSENTE' | 'PENDIENTE') => {
    const toastId = toast.loading(`Cambiando estado a ${nuevoEstado}...`);
    try {
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
      toast.error(err.message, { id: toastId });
    }
  };
  
  const openDeleteModal = (id: number) => {
    setInscripcionParaEliminar(id);
    setIsModalOpen(true);
  };

  const handleDeleteInscripcion = async () => {
    if (!inscripcionParaEliminar) return;
    const toastId = toast.loading('Dando de baja al inscripto...');
    try {
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
  // --- End Placeholder methods ---


  if (error) return <div className="p-4 text-red-500 bg-red-100 rounded-lg">{error}</div>;
  if (!capacitacionData) return <div className="p-4">Cargando...</div>;


  return (
    // Se elimina AdminLayout para evitar el doble sidebar
    <div>
      {/* --- Header (MODIFICADO) --- */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <Link href="/admin/capacitaciones" className="text-sm text-blue-600 hover:underline mb-2 block">
            &larr; Volver a Gestión
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">{capacitacionData.nombre}</h1>
            <p className="text-lg text-gray-600 mt-1">Instructor: {capacitacionData.instructor}</p>
            <p className="text-md text-gray-600 mt-1">Ubicación: {capacitacionData.ubicacion}</p>
            <p className="text-sm text-gray-500 mt-1">Estado: {capacitacionData.visible ? 'Público' : 'Oculto'}</p>
        </div>
        
        {/* Botones de Acción (Editar y Exportar) */}
        <div className="flex space-x-2">
            <Link 
              href={`/admin/capacitaciones/${id}/edit`}
              className={`bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center ${apiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-disabled={apiLoading}
              onClick={(e) => { if (apiLoading) e.preventDefault(); }}
            >
                <FiEdit className="mr-2" />
                Editar Capacitación
            </Link>
            <button 
              onClick={handleExport}
              className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              disabled={apiLoading} 
            >
                <FiDownload className="mr-2" />
                Exportar Todo (CSV)
            </button>
        </div>
      </div>
      
      {/* --- Sección de Grupos (MODIFICADA para Fase 6.2) --- */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 flex justify-between items-center">
            Grupos Programados
        </h2>
        
        {capacitacionData.grupos.length === 0 ? (
            <p className="text-gray-500 italic">No hay grupos programados para esta capacitación.</p>
        ) : (
            <div className="space-y-4">
                {capacitacionData.grupos.map((grupo, index) => (
                    <div key={grupo.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900">Grupo {index + 1}</h3>
                            <div className="text-sm text-gray-700 space-y-1 mt-1">
                                <p>
                                    <FiCalendar className="inline mr-2 text-[#D80027]"/> 
                                    Inicio: {formatDateTime(grupo.fechaInicio)}
                                </p>
                                <p>
                                    <FiCalendar className="inline mr-2 text-[#D80027]"/> 
                                    Fin: {formatDateTime(grupo.fechaFin)}
                                </p>
                                <p>
                                    <FiUsers className="inline mr-2 text-[#D80027]"/> 
                                    Cupo: {grupo.inscripcionesCount} / {grupo.cupoMaximo}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex space-x-3">
                            {/* BOTÓN DE ACCIÓN: Gestión de Inscriptos (R3) */}
                            <Link 
                                href={`/admin/grupos/${grupo.id}/inscriptos`}
                                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 flex items-center"
                            >
                                <FiUsers className="mr-2" />
                                Ver Inscriptos ({grupo.inscripcionesCount})
                            </Link>

                            <Link 
                                href={`/admin/capacitaciones/${capacitacionData.id}/edit`} 
                                className="text-sm px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-150 flex items-center"
                                title="Editar grupo se hace desde la vista de edición"
                            >
                                <FiEdit2 className="mr-2" />
                                Editar Grupos
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* --- Tabla de Inscriptos (SE MANTIENE PARA CUMPLIR CON EL CONTRATO ORIGINAL, PERO SERÁ ELIMINADA EN R8) */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Inscriptos Anteriores ({inscriptos.length})</h2>
        {/* Este código es placeholder, la gestión se mueve a la nueva ruta /admin/grupos/:id/inscriptos */}
        <p className="text-sm text-red-500">
            NOTA: Esta sección será eliminada en la Fase 8.0, ya que la gestión de asistencia se realiza a nivel de grupo.
        </p>
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

// --- getServerSideProps (MODIFICADO para Fase 5.1/R6) ---
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const cookies = nookies.get(context);
  const token = cookies.token;
  if (!token) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  const { id } = context.params!;
  try {
    // Endpoint 1: Detalle de Capacitación (Incluye grupos)
    // Usamos el endpoint de admin para obtener datos completos (incluyendo visibles:false)
    const resCap = await fetch(`${API_BASE_URL}/api/capacitaciones/admin/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
    });

    // Endpoint 2: Lista de Inscriptos (Se mantiene para la funcionalidad de exportación total)
    const resIns = await fetch(`${API_BASE_URL}/api/capacitaciones/${id}/inscriptos`, { 
        headers: { Authorization: `Bearer ${token}` } 
    });


    if (resCap.status === 401 || resIns.status === 401) {
        nookies.destroy(context, 'token', { path: '/' });
        return { redirect: { destination: '/admin/login', permanent: false } };
    }
    if (resCap.status === 404) {
      return { notFound: true };
    }

    if (!resCap.ok) { return { props: { capacitacion: null, inscriptos: [], error: `Error ${resCap.status} al cargar la capacitación.` } }; }
    
    // Si la lista de inscritos falla, devolvemos un array vacío pero el programa sigue
    const dataCap = await resCap.json();
    const dataInscriptos = resIns.ok ? await resIns.json() : [];
    
    return { props: { capacitacion: dataCap, inscriptos: dataInscriptos } };
  } catch (err: any) {
    console.error(`SSR DEBUG: Error fetching data in admin/[id].tsx for ID ${id}:`, err);
    return { props: { capacitacion: null, inscriptos: [], error: 'No se pudo conectar.' } };
  }
};