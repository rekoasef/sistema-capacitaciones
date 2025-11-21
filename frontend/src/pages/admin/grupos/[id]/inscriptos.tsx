// frontend/src/pages/admin/grupos/[id]/inscriptos.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FiArrowLeft, FiUserCheck, FiUserX, FiCalendar, FiClock, FiUsers, FiMapPin } from 'react-icons/fi'; 
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import toast from 'react-hot-toast';
import { useApi } from '@/hooks/useApi';
import nookies from 'nookies';
import AdminLayout from '@/components/AdminLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- INTERFACES ---

type EstadoInscripcion = 'AUSENTE' | 'ASISTIÓ' | 'PENDIENTE' | 'CANCELADA'; 

interface GrupoSegmento {
    id?: number;
    dia: string; // YYYY-MM-DD
    horaInicio: string; // HH:MM
    horaFin: string; // HH:MM
}

interface Capacitacion {
  id: number;
  nombre: string;
  ubicacion: string; 
}

interface ConcesionarioSimple {
    nombre: string;
}

interface Inscripcion {
  id: number;
  nombreUsuario: string;
  emailUsuario: string;
  telefono: string | null;
  concesionario: ConcesionarioSimple | null; 
  estado: EstadoInscripcion;
  createdAt: string;
}

interface Grupo {
  id: number;
  capacitacion: Capacitacion;
  fechaInicio?: string; 
  fechaFin?: string;
  cupoMaximo: number;
  inscripciones: Inscripcion[];
  segmentos: GrupoSegmento[]; 
  kpis?: any;
}

type PageProps = {
  grupo: Grupo | null;
  error?: string;
};

// --- HELPERS ---

const formatDateOnly = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('es-AR', options);
};

const getStatusBadge = (status: EstadoInscripcion) => {
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


// Componente principal
export default function GrupoInscriptosPage({
  grupo: initialGrupo,
  error: initialError,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  
  const router = useRouter();
  const { id: grupoId } = router.query;
  const { request, loading: apiLoading } = useApi(); 

  const [grupo, setGrupo] = useState(initialGrupo);
  const [error] = useState(initialError); 
  const [filter, setFilter] = useState('');
  
  // --- FUNCIÓN DE REFRESCO ---
  const fetchData = useCallback(async () => {
    if (!grupoId) return;
    try {
        const data: Grupo = await request(`/grupos/${grupoId}/inscriptos`); 
        setGrupo(data);
    } catch (err) {
        console.error("Error fetching group data on refresh:", err);
    }
  }, [grupoId, request]);
  
  useEffect(() => {
    if (initialGrupo) setGrupo(initialGrupo);
  }, [initialGrupo]);


  // --- RETORNOS CONDICIONALES ---
  if (error) {
    return (
      <AdminLayout>
        <div className="p-4 text-red-500 bg-red-100 rounded-lg max-w-4xl mx-auto my-8">
            <h1 className="text-xl font-bold text-red-600">Error de Carga</h1>
            <p>{error}</p>
        </div>
      </AdminLayout>
    );
  }
  if (!grupo) {
    return (
      <AdminLayout>
        <div className="p-4 max-w-4xl mx-auto my-8">Cargando o Grupo no encontrado...</div>
      </AdminLayout>
    );
  }
  
  const { capacitacion } = grupo;
  const inscriptos = grupo.inscripciones || [];
  const inscripcionesCount = inscriptos.length;
  const cupoDisponible = grupo.cupoMaximo - inscripcionesCount;

  
  // --- LÓGICA DE FILTRADO (useMemo) ---
  const filteredInscriptos = useMemo(() => {
    if (!filter) return inscriptos;
    const lowerCaseFilter = filter.toLowerCase();
    return inscriptos.filter(i => {
        const concesionarioNombre = i.concesionario?.nombre?.toLowerCase() || '';
        const telefono = i.telefono || '';
        
        return (
            i.nombreUsuario.toLowerCase().includes(lowerCaseFilter) ||
            i.emailUsuario.toLowerCase().includes(lowerCaseFilter) ||
            concesionarioNombre.includes(lowerCaseFilter) ||
            telefono.includes(lowerCaseFilter)
        );
    });
  }, [inscriptos, filter]);
  
  
  // --- MANEJADOR DE ASISTENCIA (useCallback) ---
  const handleToggleAsistencia = useCallback(async (inscripcionId: number) => {
    const inscripcion = inscriptos.find(i => i.id === inscripcionId);
    if (!inscripcion) return;

    const newEstado = inscripcion.estado === 'ASISTIÓ' ? 'AUSENTE' : 'ASISTIÓ'; 
    const toastId = toast.loading(`Actualizando asistencia a ${newEstado}...`);

    try {
      await request<Inscripcion>(`/inscripciones/${inscripcionId}`, {
        method: 'PATCH',
        body: { estado: newEstado }, 
      });

      fetchData(); 

      toast.success('Asistencia actualizada con éxito.', { id: toastId });

    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar asistencia.', { id: toastId });
    }
  }, [inscriptos, request, fetchData]);


  // --- RENDERIZADO ---
  return (
    <AdminLayout>
      <Head>
        <title>Inscriptos | {capacitacion.nombre} - Admin</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-extrabold text-gray-900">
                Gestión de Inscriptos del Grupo #{grupoId}
            </h1>
            <Link href={`/admin/capacitaciones/${capacitacion.id}`} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                <FiArrowLeft className="w-4 h-4 mr-1" />
                Volver a la Capacitación
            </Link>
        </div>

        {/* --- Detalles del Grupo (TAREA 9.4.2) --- */}
        <div className="bg-white p-6 shadow-xl rounded-lg mb-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{capacitacion.nombre}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Columna 1: Información general */}
                <div className='border-r pr-4'>
                    <div className="flex items-center text-lg font-semibold text-gray-700 mb-2">
                        <FiMapPin className="w-5 h-5 mr-2 text-blue-500" />
                        <p>Ubicación: {capacitacion.ubicacion}</p>
                    </div>
                    {/* KPI de Cupo */}
                    <div className="flex items-center text-lg font-semibold text-gray-700">
                        <FiUsers className="w-5 h-5 mr-2 text-blue-500" />
                        <p>
                            Cupo: {inscripcionesCount} / {grupo.cupoMaximo} 
                            <span className={`ml-2 text-sm font-normal ${cupoDisponible <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                                ({cupoDisponible <= 0 ? 'Completo' : `${cupoDisponible} libre(s)`})
                            </span>
                        </p>
                    </div>
                </div>

                {/* Columna 2: Segmentos de Horario */}
                <div className='md:col-span-2'>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                        <FiClock className="w-5 h-5 mr-2 text-blue-600" />
                        Programación Detallada:
                    </h3>
                    {/* FIX: Encadenamiento Opcional (?) para evitar el error de 'length' */}
                    {grupo.segmentos?.length > 0 ? ( 
                        <ul className="text-sm text-gray-700 space-y-1">
                            {grupo.segmentos.map((segmento, i) => (
                                <li key={i}>
                                    <span className="font-semibold mr-1">{formatDateOnly(segmento.dia)}:</span> {segmento.horaInicio} - {segmento.horaFin} hs
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-red-500">
                            Advertencia: Este grupo no tiene segmentos de horario definidos.
                        </p>
                    )}
                </div>
            </div>
        </div>
        

        {/* --- Tabla de Inscripciones --- */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre, email, teléfono o concesionario..."
            className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <p className="text-sm text-gray-500 mt-2">Total Inscriptos: {filteredInscriptos.length}</p>
        </div>

        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email / Teléfono
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concesionario
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInscriptos.length > 0 ? (
                filteredInscriptos.map((inscripcion) => (
                  <tr key={inscripcion.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inscripcion.nombreUsuario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inscripcion.emailUsuario}
                      <br />
                      <span className='text-xs text-gray-400'>{inscripcion.telefono || 'Sin Teléfono'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inscripcion.concesionario?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        {getStatusBadge(inscripcion.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleAsistencia(inscripcion.id)}
                        disabled={apiLoading}
                        className={`text-blue-600 hover:text-blue-900 ml-4 p-2 rounded-full transition-colors ${apiLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                        title={inscripcion.estado === 'ASISTIÓ' ? 'Marcar como AUSENTE' : 'Marcar como ASISTIÓ'}
                      >
                        {inscripcion.estado === 'ASISTIÓ' ? <FiUserX className="w-5 h-5" /> : <FiUserCheck className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {filter ? 'No se encontraron inscriptos con ese filtro.' : 'No hay inscriptos para este grupo todavía.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

// getServerSideProps (Se mantiene igual, confiando en el backend de la Tarea 9.2)
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
  const cookies = nookies.get(context);
  const token = cookies.token;
  const { id } = context.params!; 
  
  if (!token) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/grupos/${id}/inscriptos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
        nookies.destroy(context, 'token');
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }
    
    if (res.status === 404) {
      return { notFound: true };
    }
    
    if (!res.ok) { 
        const errorData = await res.json();
        console.error(`Error ${res.status} al cargar el grupo: ${id}`, errorData);
        return { props: { grupo: null, error: errorData.message || 'Error al cargar los inscriptos del grupo.' } }; 
    }
    
    const data: Grupo = await res.json();

    return { 
      props: { 
        grupo: data,
      } 
    };
  } catch (err: any) {
    console.error(`SSR DEBUG: Error fetching data in grupos/[id]/inscriptos.tsx for ID ${id}:`, err);
    return { props: { grupo: null, error: 'No se pudo conectar con el servidor de datos.' } };
  }
};