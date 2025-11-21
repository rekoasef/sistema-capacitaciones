// frontend/src/pages/capacitaciones/[id].tsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
// Se añade FiClock para mostrar los segmentos
import { FiCalendar, FiMapPin, FiInfo, FiHome, FiRefreshCw, FiClock } from 'react-icons/fi';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import toast from 'react-hot-toast';
import { useApi } from '@/hooks/useApi';
import nookies from 'nookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- INTERFACES DE LA FASE 9.0 ---

interface GrupoSegmento {
    id?: number; 
    dia: string; // YYYY-MM-DD
    horaInicio: string; // HH:MM
    horaFin: string; // HH:MM
}

interface Grupo {
  id: number;
  // TAREA 9.4: Las fechas ahora son opcionales/derivadas
  fechaInicio?: string; 
  fechaFin?: string;
  cupoMaximo: number;
  inscripcionesCount: number; 
  segmentos: GrupoSegmento[]; // Nuevo campo clave
}
interface Capacitacion {
  id: number;
  nombre: string;
  descripcion: string;
  ubicacion: string; 
  instructor: string;
  grupos: Grupo[]; 
}
interface Concesionario {
  id: number;
  nombre: string;
}
type PageProps = {
  capacitacion: Capacitacion | null;
  concesionarios: Concesionario[]; 
  error?: string;
};

// --- HELPERS ---

// Helper para formatear solo la fecha (YYYY-MM-DD)
const formatDateOnly = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('es-AR', options);
};


// Componente principal
export default function DetalleCapacitacionPage({
  capacitacion,
  concesionarios,
  error: initialError,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  
  const router = useRouter();
  const { id } = router.query;
  const [localError] = useState(initialError || ''); 
  
  const { request, loading } = useApi();

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    emailUsuario: '',
    telefono: '',
    grupoId: capacitacion?.grupos.length && (capacitacion.grupos[0].cupoMaximo - capacitacion.grupos[0].inscripcionesCount > 0) 
      ? capacitacion.grupos[0].id.toString() 
      : '',
    concesionarioId: '',
  });


  // --- RETORNOS CONDICIONALES ---
  if (initialError) return <div className="p-4 text-red-500 bg-red-100 rounded-lg max-w-4xl mx-auto my-8">{localError}</div>;
  if (!capacitacion) return <div className="p-4 max-w-4xl mx-auto my-8">Cargando o Capacitación no encontrada...</div>;
  
  
  // Manejadores
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Procesando inscripción...');
    
    try {
      if (!formData.nombreUsuario || !formData.emailUsuario || !formData.grupoId) {
        throw new Error('Por favor, complete todos los campos obligatorios.');
      }
      
      const payload = {
        nombreUsuario: formData.nombreUsuario,
        emailUsuario: formData.emailUsuario,
        telefono: formData.telefono,
        grupoId: parseInt(formData.grupoId),
        concesionarioId: formData.concesionarioId ? parseInt(formData.concesionarioId) : 0, 
      };

      // Se usa request<any> para simplificar la llamada
      const newInscripcion = await request<any>(`/inscripciones`, { 
        method: 'POST', 
        body: payload, 
        isPublic: true
      });
      
      toast.success('¡Inscripción exitosa! Redirigiendo...', { id: toastId });
      
      router.push(`/inscripcion/exito?c_id=${id}`); 

    } catch (err: any) {
      const message = err.message || 'Error desconocido al inscribirse.';
      toast.error(message, { id: toastId });
    }
  };


  // Renderizado
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{capacitacion.nombre} - Crucianelli</title>
      </Head>

      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                &larr; Volver al Catálogo
            </Link>
            <img src="/logo.jpg" alt="Crucianelli Logo" className="h-10" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* --- Columna de Detalles --- */}
            <div className="lg:col-span-2">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-4">{capacitacion.nombre}</h1>
                <p className="text-xl text-gray-600 mb-8">{capacitacion.instructor}</p>

                <section className="mb-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Descripción</h2>
                    <p className="text-gray-700 whitespace-pre-line">{capacitacion.descripcion}</p>
                </section>
                
                <section className="mb-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalles Clave</h2>
                    <div className="space-y-4">
                        <div className="flex items-start text-gray-700">
                            <FiMapPin className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Lugar:</p>
                                <p>{capacitacion.ubicacion}</p> 
                            </div>
                        </div>
                        <div className="flex items-start text-gray-700">
                            <FiInfo className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Instructor:</p>
                                <p>{capacitacion.instructor}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Fechas y Grupos Disponibles</h2>
                    {capacitacion.grupos.length > 0 ? ( 
                        <div className="space-y-4">
                            {capacitacion.grupos.map(grupo => {
                                const cupoDisponible = grupo.cupoMaximo - grupo.inscripcionesCount;
                                const isFull = cupoDisponible <= 0;
                                return (
                                    <div key={grupo.id} className={`p-4 rounded-lg border flex flex-col justify-between ${isFull ? 'bg-red-50 border-red-200 opacity-70' : 'bg-green-50 border-green-200'}`}>
                                        
                                        {/* TAREA 9.4: MOSTRAR SEGMENTOS DETALLADOS */}
                                        <div className="mb-3">
                                            <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                                                <FiCalendar className={`w-5 h-5 mr-2 ${isFull ? 'text-red-600' : 'text-green-600'}`} />
                                                Programación:
                                            </h3>
                                            <ul className="text-sm text-gray-700 space-y-1 pl-2">
                                                {grupo.segmentos.map((segmento, i) => (
                                                    <li key={i} className="flex items-center">
                                                        <FiClock className="w-3 h-3 mr-2 text-gray-600" />
                                                        **{formatDateOnly(segmento.dia)}:** {segmento.horaInicio} - {segmento.horaFin} hs
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Información de Cupo */}
                                        <div className='text-right border-t pt-3'>
                                            <p className={`font-bold ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                                                {isFull ? '¡Cupo Completo!' : `Quedan ${cupoDisponible} lugares`}
                                            </p>
                                            <p className="text-xs text-gray-500">Total: {grupo.cupoMaximo}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500">Aún no hay grupos programados para esta capacitación.</p>
                    )}
                </section>
            </div>

            {/* --- Columna de Formulario --- */}
            <div className="lg:col-span-1">
                <div className="sticky top-12 bg-white p-6 rounded-xl shadow-2xl border border-blue-100">
                    <h2 className="text-2xl font-extrabold text-blue-600 mb-6">Formulario de Inscripción</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* (El resto del formulario se mantiene igual) */}
                        <div>
                            <label htmlFor="nombreUsuario" className="block text-sm font-medium text-gray-700">Nombre y Apellido *</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type="text"
                                    name="nombreUsuario"
                                    id="nombreUsuario"
                                    required
                                    value={formData.nombreUsuario}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="emailUsuario" className="block text-sm font-medium text-gray-700">Email *</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type="email"
                                    name="emailUsuario"
                                    id="emailUsuario"
                                    required
                                    value={formData.emailUsuario}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type="tel"
                                    name="telefono"
                                    id="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    placeholder="Ej: 11 5555 6666"
                                />
                            </div>
                        </div>

                        {/* Selector de Grupo */}
                        <div>
                            <label htmlFor="grupoId" className="block text-sm font-medium text-gray-700">Seleccionar Grupo / Fecha *</label>
                            <select
                                id="grupoId"
                                name="grupoId"
                                required
                                value={formData.grupoId}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base border focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-700"
                            >
                                <option value="">Seleccione una fecha...</option>
                                {capacitacion.grupos.map(grupo => {
                                    const cupoDisponible = grupo.cupoMaximo - grupo.inscripcionesCount;
                                    const isFull = cupoDisponible <= 0;
                                    return (
                                        <option 
                                            key={grupo.id} 
                                            value={grupo.id} 
                                            disabled={isFull} 
                                        >
                                            {/* Mostrar rango de fechas derivado para el selector */}
                                            {formatDateOnly(grupo.fechaInicio)} al {formatDateOnly(grupo.fechaFin)} - {isFull ? ' (Completo)' : ` (${cupoDisponible} libres)`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        
                        {/* Selector de Concesionario */}
                        <div>
                            <label htmlFor="concesionarioId" className="block text-sm font-medium text-gray-700">Concesionario (Opcional)</label>
                            <select
                                id="concesionarioId"
                                name="concesionarioId"
                                value={formData.concesionarioId}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base border focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-gray-700"
                            >
                                <option value="">(Ninguno / No aplica)</option>
                                {concesionarios.map(concesionario => (
                                    <option key={concesionario.id} value={concesionario.id}>
                                        {concesionario.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Botón de Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'}`}
                        >
                            {loading ? 'Inscribiendo...' : 'Inscribirse Ahora'}
                        </button>
                    </form>
                    <p className="mt-4 text-xs text-center text-gray-500">* Campos obligatorios.</p>
                </div>
            </div>
        </div>
      </main>
      
      <footer className="bg-white text-gray-800 p-6 text-center mt-12">
        <p>© {new Date().getFullYear()} Crucianelli S.A. | Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

// getServerSideProps (Se mantiene igual)
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
  context.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { id } = context.params!; 
  try {
    // El backend ahora devuelve los grupos con segmentos anidados (TAREA 9.2)
    const resCap = await fetch(`${API_BASE_URL}/api/capacitaciones/${id}`);
    
    const resCon = await fetch(`${API_BASE_URL}/api/concesionarios`);

    if (resCap.status === 404) {
      return { notFound: true };
    }
    
    if (!resCap.ok) { 
        console.error(`Error ${resCap.status} al cargar la capacitación: ${id}`);
        return { props: { capacitacion: null, concesionarios: [], error: 'Error al cargar la capacitación. Intente más tarde.' } }; 
    }
    
    const dataCap: Capacitacion = await resCap.json();

    const dataCon: Concesionario[] = resCon.ok ? await resCon.json() : [];

    return { 
      props: { 
        capacitacion: dataCap, 
        concesionarios: dataCon 
      } 
    };
  } catch (err: any) {
    console.error(`SSR DEBUG: Error fetching data in capacitaciones/[id].tsx for ID ${id}:`, err);
    return { props: { capacitacion: null, concesionarios: [], error: 'No se pudo conectar con el servidor de datos.' } };
  }
};