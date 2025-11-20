// frontend/src/pages/capacitaciones/[id].tsx

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiMapPin, FiPhone, FiInfo } from 'react-icons/fi';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import toast from 'react-hot-toast';
import { useApi } from '@/hooks/useApi';

// Definimos la URL base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// Interfaces
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
  descripcion: string;
  lugar: string;
  instructor: string;
}
interface Concesionario {
  id: number;
  nombre: string;
}
type PageProps = {
  capacitacion: Capacitacion | null;
  grupos: Grupo[];
  concesionarios: Concesionario[];
  error?: string;
};

// Componente principal
export default function DetalleCapacitacionPage({
  capacitacion,
  grupos,
  concesionarios,
  error: initialError,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  
  const router = useRouter();
  const { request, loading } = useApi();
  const [error, setError] = useState(initialError || '');

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    emailUsuario: '',
    telefono: '',
    grupoId: grupos.length > 0 ? grupos[0].id.toString() : '',
    concesionarioId: '',
  });

  if (error) return <div className="p-4 text-red-500 bg-red-100 rounded-lg max-w-4xl mx-auto my-8">{error}</div>;
  if (!capacitacion) return <div className="p-4 max-w-4xl mx-auto my-8">Cargando o Capacitación no encontrada...</div>;

  // Manejadores
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Procesando inscripción...');
    setError('');

    try {
      // Validación básica
      if (!formData.nombreUsuario || !formData.emailUsuario || !formData.grupoId) {
        throw new Error('Por favor, complete todos los campos obligatorios.');
      }
      
      const payload = {
        nombreUsuario: formData.nombreUsuario,
        emailUsuario: formData.emailUsuario,
        telefono: formData.telefono,
        grupoId: parseInt(formData.grupoId),
        concesionarioId: formData.concesionarioId ? parseInt(formData.concesionarioId) : null,
      };

      await request(`/inscripciones`, { 
        method: 'POST', 
        body: payload, 
        isPublic: true
      });
      
      toast.success('¡Inscripción exitosa! Recibirás un correo de confirmación.', { id: toastId });
      // Recargar la página para actualizar el contador de cupos.
      router.replace(router.asPath);

    } catch (err: any) {
      const message = err.message || 'Error desconocido al inscribirse.';
      setError(message);
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
                                <p>{capacitacion.lugar}</p>
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
                    {grupos.length > 0 ? (
                        <div className="space-y-4">
                            {grupos.map(grupo => {
                                const cupoDisponible = grupo.cupoMaximo - grupo.inscripcionesCount;
                                const isFull = cupoDisponible <= 0;
                                return (
                                    <div key={grupo.id} className={`p-4 rounded-lg border flex justify-between items-center ${isFull ? 'bg-red-50 border-red-200 opacity-70' : 'bg-green-50 border-green-200'}`}>
                                        <div className='flex items-center'>
                                            <FiCalendar className={`w-5 h-5 mr-3 ${isFull ? 'text-red-600' : 'text-green-600'}`} />
                                            <div>
                                                <p className="font-semibold text-gray-800">Inicio: {new Date(grupo.fechaInicio).toLocaleDateString('es-AR', { dateStyle: 'full' })}</p>
                                                <p className="text-sm text-gray-600">Fin: {new Date(grupo.fechaFin).toLocaleDateString('es-AR', { dateStyle: 'full' })}</p>
                                            </div>
                                        </div>
                                        <div className='text-right'>
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
                    
                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Campo Nombre */}
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

                        {/* Campo Email */}
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

                        {/* Campo Teléfono */}
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
                                {grupos.map(grupo => {
                                    const cupoDisponible = grupo.cupoMaximo - grupo.inscripcionesCount;
                                    const isDisabled = cupoDisponible <= 0;
                                    return (
                                        <option 
                                            key={grupo.id} 
                                            value={grupo.id} 
                                            disabled={isDisabled}
                                        >
                                            {new Date(grupo.fechaInicio).toLocaleDateString('es-AR')} - {isDisabled ? ' (Completo)' : ` (${cupoDisponible} libres)`}
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

// getServerSideProps (CON LA CORRECCIÓN DEL PREFIJO /api)
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  context.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { id } = context.params!; 
  try {
    // CORRECCIÓN: Se agrega el prefijo /api/ a todas las llamadas SSR de API
    const [resCap, resGru, resCon] = await Promise.all([
      fetch(`${API_BASE_URL}/api/capacitaciones/${id}`),
      fetch(`${API_BASE_URL}/api/grupos`),
      fetch(`${API_BASE_URL}/api/concesionarios`),
    ]);

    if (resCap.status === 404) {
      return { notFound: true };
    }
    
    // Si la capacitación no existe o hay un error en la primera consulta (404, 500, etc.)
    if (!resCap.ok) { 
        console.error(`Error ${resCap.status} al cargar la capacitación: ${id}`);
        return { props: { capacitacion: null, grupos: [], concesionarios: [], error: 'Error al cargar la capacitación. Intente más tarde.' } }; 
    }
    
    const dataCap = await resCap.json();

    // Las otras dos consultas son auxiliares, si fallan, se devuelve array vacío
    const dataGru = resGru.ok ? await resGru.json() : [];
    const dataCon = resCon.ok ? await resCon.json() : [];

    return { 
      props: { 
        capacitacion: dataCap, 
        grupos: dataGru, 
        concesionarios: dataCon 
      } 
    };
  } catch (err: any) {
    console.error(`SSR DEBUG: Error fetching data in capacitaciones/[id].tsx for ID ${id}:`, err);
    return { props: { capacitacion: null, grupos: [], concesionarios: [], error: 'No se pudo conectar con el servidor de datos.' } };
  }
};