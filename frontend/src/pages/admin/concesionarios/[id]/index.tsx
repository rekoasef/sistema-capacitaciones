// frontend/src/pages/admin/concesionarios/[id]/index.tsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FiEdit, FiDownload, FiCalendar, FiBookOpen } from 'react-icons/fi'; 
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import nookies from 'nookies';
import toast from 'react-hot-toast';
import { useApi } from '@/hooks/useApi'; 
import ConfirmModal from '@/components/ConfirmModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- INTERFACES ACTUALIZADAS (R5) ---
type InscripcionEstado = 'PENDIENTE' | 'ASISTIÓ' | 'AUSENTE' | 'CANCELADA';

interface CapacitacionReporte {
  nombre: string;
}

interface GrupoReporte {
  fechaInicio: string;
  fechaFin: string;
  capacitacion: CapacitacionReporte; // Incluimos la capacitación
}

interface InscripcionReporte {
  id: number;
  nombreUsuario: string;
  emailUsuario: string;
  telefono: string | null;
  estado: InscripcionEstado; // R5: Estado de Asistencia
  createdAt: string;
  grupo: GrupoReporte; // R5: Detalles del grupo
}

interface ConcesionarioReporte {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  inscripciones: InscripcionReporte[];
}

type PageProps = {
  concesionario: ConcesionarioReporte | null;
  error?: string;
};
// --- FIN INTERFACES ---

// --- HELPERS ---

// Devuelve el texto y el color de Tailwind para el estado (R5)
const getStatusBadge = (status: InscripcionEstado) => {
    switch (status) {
        case 'ASISTIÓ':
            return <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Asistió</span>;
        case 'AUSENTE':
            return <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Ausente</span>;
        case 'PENDIENTE':
            return <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Pendiente</span>;
        case 'CANCELADA':
            return <span className="px-3 py-1 text-xs font-medium text-gray-800 bg-gray-200 rounded-full">Cancelada</span>;
        default:
            return <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">Desconocido</span>;
    }
};

// Formatea la fecha
const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('es-AR', dateOptions);
};

// --- COMPONENTE PRINCIPAL ---

export default function DetalleConcesionarioPage({ concesionario: initialConcesionario, error: initialError }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { id } = router.query;

  const [error] = useState(initialError || '');
  const [concesionarioData] = useState(initialConcesionario); 

  const { loading: apiLoading } = useApi(); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any | null>(null);

  // --- Funcionalidad de Exportar Reporte (Placeholder) ---
  const handleExport = () => {
    // FIX: Cambiamos toast.info() por toast()
    toast("Funcionalidad de exportación de reporte pendiente de implementación.");
  };

  // --- Funcionalidad de Edición/Eliminación (Placeholder o delegada) ---
  const openEditModal = (concesionario: ConcesionarioReporte) => {
    setItemToEdit(concesionario);
    setIsModalOpen(true);
  };

  // --- Renderizado ---

  if (error) return <div className="p-4 text-red-500 bg-red-100 rounded-lg max-w-7xl mx-auto my-8">{error}</div>;
  if (!concesionarioData) return <div className="p-4 max-w-7xl mx-auto my-8">Cargando o Concesionario no encontrado...</div>;

  return (
    <div>
      <Head>
        <title>Reporte Concesionario {concesionarioData.nombre} - Admin</title>
      </Head>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <Link href="/admin/concesionarios" className="text-sm text-blue-600 hover:underline mb-2 block">
            &larr; Volver a Gestión
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">Reporte: {concesionarioData.nombre}</h1>
            <p className="text-lg text-gray-600 mt-1">Email: {concesionarioData.email}</p>
            <p className="text-md text-gray-600 mt-1">Teléfono: {concesionarioData.telefono || 'N/A'}</p>
        </div>
        
        {/* Botones de Acción */}
        <div className="flex space-x-2">
            <button 
                onClick={() => openEditModal(concesionarioData)}
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
                <FiEdit className="mr-2" />
                Editar Concesionario
            </button>
            <button 
                onClick={handleExport}
                className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                disabled={apiLoading}
            >
                <FiDownload className="mr-2" />
                Exportar Reporte (CSV)
            </button>
        </div>
      </div>
      
      {/* --- Tabla de Inscripciones (Reporte Avanzado R5) --- */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FiBookOpen className='mr-2' /> Historial de Inscripciones ({concesionarioData.inscripciones.length})
        </h2>
        
        {concesionarioData.inscripciones.length === 0 ? (
            <p className="text-gray-500 italic">Este concesionario no tiene inscripciones registradas.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Participante
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Capacitación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Grupo (Fecha Inicio)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado Asistencia
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha Inscripción
                            </th>
                            
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {concesionarioData.inscripciones.map((inscripcion) => (
                            <tr key={inscripcion.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {inscripcion.nombreUsuario}
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {inscripcion.grupo.capacitacion.nombre}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <span className="flex items-center">
                                        <FiCalendar className="w-4 h-4 mr-1 text-gray-500" />
                                        {formatDate(inscripcion.grupo.fechaInicio)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {getStatusBadge(inscripcion.estado)}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {inscripcion.emailUsuario}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(inscripcion.createdAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Modal de edición (placeholder) */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // FIX: Cambiamos toast.info() por toast()
        onConfirm={() => { toast('Funcionalidad de edición delegada.'); setIsModalOpen(false); }}
        title="Editar Concesionario"
        message="La edición del concesionario se realizaría en un formulario dedicado."
        confirmText="Aceptar"
      />
    </div>
  );
}

// --- getServerSideProps (Se mantiene la lógica para obtener el reporte) ---
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const cookies = nookies.get(context);
  const token = cookies.token;
  if (!token) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  const { id } = context.params!;
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/concesionarios/reporte/${id}`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });

    if (res.status === 401) {
        nookies.destroy(context, 'token', { path: '/' });
        return { redirect: { destination: '/admin/login', permanent: false } };
    }

    if (res.status === 404) {
      return { notFound: true };
    }

    if (!res.ok) { 
        console.error(`Error ${res.status} al cargar el reporte del concesionario: ${id}`);
        return { props: { concesionario: null, error: `Error ${res.status} al cargar el reporte.` } }; 
    }
    
    const data: ConcesionarioReporte = await res.json();
    
    return { props: { concesionario: data } };
  } catch (err: any) {
    console.error(`SSR DEBUG: Error fetching data in concesionarios/[id]/index.tsx for ID ${id}:`, err);
    return { props: { concesionario: null, error: 'No se pudo conectar con el servidor de datos.' } };
  }
};