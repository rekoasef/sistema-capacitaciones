// frontend/src/pages/admin/capacitaciones/[id].tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiDownload, FiEdit, FiCalendar, FiUsers, FiEdit2 } from 'react-icons/fi'; 
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import nookies from 'nookies';
import toast from 'react-hot-toast';
import { useApi } from '@/hooks/useApi'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- Interfaces ---
interface Grupo { 
  id: number; 
  fechaInicio: string; 
  fechaFin: string; 
  cupoMaximo: number; 
  inscripcionesCount: number; 
}

interface Capacitacion { 
  id: number; 
  nombre: string; 
  instructor: string; 
  modalidad: string; 
  ubicacion: string; 
  grupos: Grupo[]; 
  visible: boolean;
}

// TAREA 8.1: Se eliminó el prop inscriptos de PageProps
type PageProps = { 
  capacitacion: Capacitacion | null; 
  error?: string; 
};


// --- HELPER FUNCTION ---
const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    return `${date.toLocaleDateString('es-AR', dateOptions)} ${date.toLocaleTimeString('es-AR', timeOptions)}`;
};


export default function DetalleCapacitacionPage({ capacitacion: initialCapacitacion, error: initialError }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  
  const [error] = useState(initialError || '');
  const router = useRouter();
  const { id } = router.query;

  const { loading: apiLoading } = useApi();

  const [capacitacionData, setCapacitacionData] = useState(initialCapacitacion);

  useEffect(() => {
    setCapacitacionData(initialCapacitacion);
  }, [initialCapacitacion]);


  // --- handleExport (Exportación global) ---
  const handleExport = async () => {
    const token = localStorage.getItem('token'); 
    if (!token) return router.push('/admin/login');
    
    const toastId = toast.loading('Generando CSV de todos los inscritos...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/capacitaciones/${id}/exportar/csv`, { 
            headers: { Authorization: `Bearer ${token}` }
        });
         if (response.status === 401) {
             localStorage.removeItem('token');
             nookies.destroy(null, 'token', { path: '/' }); 
             toast.error('Sesión expirada.', { id: toastId });
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
        toast.success('Exportación completa.', { id: toastId });
    } catch (err: any) {
        toast.error(err.message || 'No se pudo generar el archivo CSV.', { id: toastId });
    }
  };


  if (error) return <div className="p-4 text-red-500 bg-red-100 rounded-lg">{error}</div>;
  if (!capacitacionData) return <div className="p-4">Cargando...</div>;


  return (
    <div>
      {/* --- Header --- */}
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
        
        {/* Botones de Acción */}
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
      
      {/* --- Sección de Grupos (Foco de la gestión) --- */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4 flex justify-between items-center">
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
                                title="El manejo de grupos se realiza en la vista de edición de la capacitación."
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
      {/* TAREA 8.1: SE ELIMINÓ LA SECCIÓN DE TABLA DE INSCRIPTOS OBSOLETA (R8) */}
    </div>
  );
}

// --- getServerSideProps (Simplificado) ---
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const cookies = nookies.get(context);
  const token = cookies.token;
  if (!token) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  const { id } = context.params!;
  try {
    // Solo llamamos al endpoint de Capacitación (admin/:id)
    const resCap = await fetch(`${API_BASE_URL}/api/capacitaciones/admin/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
    });

    if (resCap.status === 401) {
        nookies.destroy(context, 'token', { path: '/' });
        return { redirect: { destination: '/admin/login', permanent: false } };
    }
    if (resCap.status === 404) {
      return { notFound: true };
    }

    if (!resCap.ok) { return { props: { capacitacion: null, error: `Error ${resCap.status} al cargar la capacitación.` } }; }
    
    const dataCap = await resCap.json();
    
    // TAREA 8.1: Ya no se maneja ni se pasa dataInscriptos
    return { props: { capacitacion: dataCap } };
  } catch (err: any) {
    console.error(`SSR DEBUG: Error fetching data in admin/[id].tsx for ID ${id}:`, err);
    return { props: { capacitacion: null, error: 'No se pudo conectar.' } };
  }
};