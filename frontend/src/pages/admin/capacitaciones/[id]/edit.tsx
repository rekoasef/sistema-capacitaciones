// frontend/src/pages/admin/capacitaciones/[id]/edit.tsx

import React, { useState, useEffect, FormEvent } from 'react';
import Head from 'next/head';
import { useApi } from '@/hooks/useApi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import nookies from 'nookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// Interfaz de datos para el Grupo
interface GrupoData {
  id?: number; // Es opcional para grupos nuevos
  fechaInicio: string;
  fechaFin: string;
  cupoMaximo: number | string;
  capacitacionId: number;
}

// Interfaz de datos para la Capacitación
interface CapacitacionData {
  id: number;
  nombre: string;
  descripcion: string;
  instructor: string;
  modalidad: 'Presencial' | 'Online';
  ubicacion: string;
  visible: boolean;
  grupos: GrupoData[]; // Incluye grupos para inicialización
}

// Interfaz para las props
type PageProps = {
  initialData: CapacitacionData | null;
  error?: string;
};

// Helper para obtener la fecha y hora actual en formato YYYY-MM-DDTHH:mm
const getLocalDatetimeString = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000; 
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

// Componente principal de Edición
const EditarCapacitacionPage = ({
  initialData,
  error: initialError,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { id } = router.query;
  const { request, loading } = useApi();
  const [error, setError] = useState(initialError || '');
  
  // Estado para la data principal (Nombre, Ubicación, etc.)
  const [capacitacionData, setCapacitacionData] = useState(initialData ? {
    id: initialData.id,
    nombre: initialData.nombre,
    descripcion: initialData.descripcion,
    instructor: initialData.instructor,
    modalidad: initialData.modalidad,
    ubicacion: initialData.ubicacion,
    visible: initialData.visible,
  } : null); 

  // Estado para la gestión de Grupos (Inicializado con los grupos existentes)
  const [grupos, setGrupos] = useState<GrupoData[]>(
    initialData?.grupos.map(g => ({
        ...g,
        // Formatear las fechas Date a strings locales para el input datetime-local
        fechaInicio: getLocalDatetimeString(new Date(g.fechaInicio)),
        fechaFin: getLocalDatetimeString(new Date(g.fechaFin)),
    })) || []
  );
  
  // Lista de IDs de grupos que deben ser eliminados al guardar
  const [gruposParaEliminar, setGruposParaEliminar] = useState<number[]>([]);

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);


  // --- MANEJADORES DE ESTADO ---
  const handleCapacitacionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setCapacitacionData(prev => ({
        ...prev!,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleGroupChange = (index: number, field: keyof GrupoData, value: string | number) => {
    const nuevosGrupos = [...grupos];
    (nuevosGrupos[index] as any)[field] = value;
    setGrupos(nuevosGrupos);
  };
  
  const handleAddGroup = () => {
    if (!capacitacionData) return;
    setGrupos([
      ...grupos,
      { // Nuevo grupo sin ID
        fechaInicio: getLocalDatetimeString(), 
        fechaFin: getLocalDatetimeString(),
        cupoMaximo: 20,
        capacitacionId: capacitacionData.id,
      },
    ]);
  };

  const handleRemoveGroup = async (index: number) => {
    const grupo = grupos[index];
    
    if (grupo.id) {
        // Si el grupo tiene ID, lo añadimos a la lista de eliminación para borrarlo del backend
        const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el Grupo #${grupo.id} y todas sus inscripciones?`);
        if (!confirmDelete) return;

        const toastId = toast.loading('Eliminando grupo...');
        try {
            // Eliminación directa en el backend (más seguro para grupos existentes)
            await request(`/grupos/${grupo.id}`, { method: 'DELETE' });
            toast.success('Grupo eliminado permanentemente.', { id: toastId });
            
            // Eliminar de la lista local
            setGrupos(grupos.filter((_, i) => i !== index));
        } catch (err: any) {
            toast.error(err.message || 'Error al eliminar el grupo.', { id: toastId });
        }

    } else {
        // Si no tiene ID, simplemente lo quitamos de la lista local (era nuevo)
        setGrupos(grupos.filter((_, i) => i !== index));
    }
  };


  // --- MANEJADOR PRINCIPAL DE ENVÍO ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!capacitacionData) return;
    
    const toastId = toast.loading('Guardando cambios...');

    // 1. Validaciones
    if (capacitacionData.modalidad === 'Presencial' && !capacitacionData.ubicacion) {
        toast.error('Para la modalidad Presencial, la ubicación es obligatoria.', { id: toastId });
        return;
    }

    try {
      // 2. PATCH: Actualizar la Capacitación principal
      const payloadCapacitacion = {
        nombre: capacitacionData.nombre,
        descripcion: capacitacionData.descripcion,
        instructor: capacitacionData.instructor,
        modalidad: capacitacionData.modalidad,
        ubicacion: capacitacionData.ubicacion,
        visible: capacitacionData.visible,
      };
      
      await request(`/capacitaciones/${id}`, {
        method: 'PATCH',
        body: payloadCapacitacion,
      });

      // 3. CRUD: Actualizar/Crear Grupos
      const grupoPromises = grupos.map((g) => {
          const payloadGrupo = {
              fechaInicio: new Date(g.fechaInicio).toISOString(),
              fechaFin: new Date(g.fechaFin).toISOString(), 
              cupoMaximo: Number(g.cupoMaximo),
              capacitacionId: capacitacionData.id,
          };

          if (g.id) {
              // Si tiene ID, es una actualización (PATCH)
              return request(`/grupos/${g.id}`, { method: 'PATCH', body: payloadGrupo });
          } else {
              // Si no tiene ID, es un nuevo grupo (POST)
              return request('/grupos', { method: 'POST', body: payloadGrupo });
          }
      });

      await Promise.all(grupoPromises);
      

      toast.success('Capacitación y grupos actualizados con éxito.', { id: toastId });
      router.push(`/admin/capacitaciones/${id}`); 
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la capacitación.', { id: toastId });
    }
  };
  
  // --- Renderizado de Errores/Cargando ---

  if (!capacitacionData && !error) {
    return <div className="p-8 text-center">Cargando datos de la capacitación...</div>;
  }
  if (error) {
    return (
        <div className="p-8 text-red-500 bg-red-100 rounded-lg max-w-4xl mx-auto my-8">
          Error: {error}
          <div className="mt-4"><Link href="/admin/capacitaciones" className="text-blue-600 hover:underline">Volver a la lista</Link></div>
        </div>
    );
  }
  if (!capacitacionData) return null;


  return (
    <>
        <Head>
            <title>Editar {capacitacionData.nombre} - Admin</title>
        </Head>
        <div className="max-w-4xl mx-auto py-8">
            <Link href={`/admin/capacitaciones/${id}`} className="flex items-center text-blue-600 hover:underline mb-4">
                <FaArrowLeft className="mr-2" /> Volver al Detalle
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Editar Capacitación: {capacitacionData.nombre}</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-6">
            
            {/* --- BLOQUE PRINCIPAL --- */}
            <h2 className="text-xl font-bold text-gray-800">Información General</h2>
            <div className="space-y-4">
                {/* Nombre y Modalidad */}
                <div className="flex space-x-4">
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre de la Capacitación *"
                        value={capacitacionData.nombre}
                        onChange={handleCapacitacionChange}
                        // FIX: Añadido text-gray-900
                        className="w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027] text-gray-900" 
                        required
                    />
                    <select
                        name="modalidad"
                        value={capacitacionData.modalidad}
                        onChange={handleCapacitacionChange}
                        // FIX: Añadido text-gray-900
                        className="w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027] text-gray-900" 
                        required
                    >
                        <option value="Presencial">Presencial</option>
                        <option value="Online">Online</option>
                    </select>
                </div>
                
                {/* Ubicación (R6) */}
                {capacitacionData.modalidad === 'Presencial' && (
                    <input
                        type="text"
                        name="ubicacion"
                        placeholder="Ubicación (Dirección o Lugar) *"
                        value={capacitacionData.ubicacion}
                        onChange={handleCapacitacionChange}
                        // FIX: Añadido text-gray-900
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027] text-gray-900" 
                        required
                    />
                )}
                
                {/* Instructor */}
                <input
                    type="text"
                    name="instructor"
                    placeholder="Instructor / Responsable"
                    value={capacitacionData.instructor}
                    onChange={handleCapacitacionChange}
                    // FIX: Añadido text-gray-900
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027] text-gray-900"
                />

                {/* Descripción */}
                <textarea
                    name="descripcion"
                    placeholder="Descripción detallada de la Capacitación"
                    value={capacitacionData.descripcion}
                    onChange={handleCapacitacionChange}
                    rows={4}
                    // FIX: Añadido text-gray-900
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027] text-gray-900"
                />
            </div>

            
            {/* --- BLOQUE DE GRUPOS MÚLTIPLES (R4: Edición de Grupos) --- */}
            <div className="pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Editar / Añadir Grupos</h2>
                
                {grupos.map((grupo, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-lg shadow-sm mb-4 relative bg-gray-50">
                    <h3 className="text-md font-semibold text-gray-700 mb-3">
                        Grupo {index + 1} {grupo.id ? `(ID: ${grupo.id})` : '(Nuevo)'}
                    </h3>
                    
                    <button
                        type="button"
                        onClick={() => handleRemoveGroup(index)}
                        className="absolute top-4 right-4 p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full"
                        title={grupo.id ? "Eliminar Grupo permanentemente" : "Cancelar nuevo grupo"}
                    >
                        <FiTrash2 size={18} />
                    </button>

                    <div className="grid grid-cols-3 gap-4">
                        
                        {/* Fecha de Inicio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Inicio (Fecha y Hora) *</label>
                            <input
                                type="datetime-local"
                                value={grupo.fechaInicio}
                                onChange={(e) => handleGroupChange(index, 'fechaInicio', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-[#D80027] focus:border-[#D80027]"
                                required
                            />
                        </div>

                        {/* Fecha de Fin */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fin (Fecha y Hora) *</label>
                            <input
                                type="datetime-local"
                                value={grupo.fechaFin}
                                onChange={(e) => handleGroupChange(index, 'fechaFin', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-[#D80027] focus:border-[#D80027]"
                                required
                            />
                        </div>
                        
                        {/* Cupo Máximo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cupo Máximo *</label>
                            <input
                                type="number"
                                placeholder="Cupo Máximo"
                                value={grupo.cupoMaximo}
                                onChange={(e) => handleGroupChange(index, 'cupoMaximo', e.target.value)}
                                min="1"
                                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-[#D80027] focus:border-[#D80027]"
                                required
                            />
                        </div>
                    </div>
                </div>
                ))}
                
                <button
                    type="button"
                    onClick={handleAddGroup}
                    className="w-full flex justify-center items-center py-2 px-4 border border-dashed border-gray-400 rounded-lg text-gray-600 hover:bg-gray-100 mt-4"
                    title="Añadir un nuevo grupo para esta capacitación"
                >
                    <FiPlus className="mr-2" />
                    Añadir Otro Grupo
                </button>
            </div>
            {/* --- FIN BLOQUE GRUPOS --- */}
          

            {/* Visibilidad */}
            <div className="flex items-center pt-4 border-t border-gray-200 mt-4">
                <input
                    id="visible"
                    name="visible"
                    type="checkbox"
                    checked={capacitacionData.visible}
                    onChange={handleCapacitacionChange}
                    className="h-4 w-4 text-[#D80027] border-gray-300 rounded focus:ring-[#D80027]"
                />
                <label htmlFor="visible" className="ml-2 block text-sm text-gray-900">
                    Visible en el catálogo público
                </label>
            </div>


            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#D80027] text-white font-semibold rounded-lg hover:bg-[#b80021] disabled:bg-gray-400 transition duration-150"
            >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            </form>
        </div>
    </>
  );
};

export default EditarCapacitacionPage;


// getServerSideProps para cargar la data inicial
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
  nookies.set(context, 'theme', 'dark'); // Fix: Ensure nookies is used for the example cookie set.
  context.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { id } = context.params!;
  const token = context.req.cookies.token; // Obtener el token de las cookies

  if (!token) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  try {
    // Usamos el endpoint de admin para obtener datos completos (incluye grupos)
    const res = await fetch(`${API_BASE_URL}/api/capacitaciones/admin/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 404) {
      return { notFound: true };
    }
    
    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
             return { redirect: { destination: '/admin/login', permanent: false } };
        }
        const errorText = await res.text();
        return { props: { initialData: null, error: `Error al cargar la capacitación (${res.status}): ${errorText.substring(0, 100)}...` } }; 
    }
    
    const data: CapacitacionData = await res.json();
    
    // El backend ya devuelve los grupos anidados con conteo (Fix 6.2.4)
    return { 
      props: { 
        initialData: data
      } 
    };
  } catch (err) {
    return { props: { initialData: null, error: 'No se pudo conectar con el servidor de datos.' } };
  }
};