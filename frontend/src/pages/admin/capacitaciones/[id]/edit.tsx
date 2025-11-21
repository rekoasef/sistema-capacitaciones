// frontend/src/pages/admin/capacitaciones/[id]/edit.tsx

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import Head from 'next/head';
import { useApi } from '@/hooks/useApi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { FiPlus, FiTrash2, FiClock } from 'react-icons/fi';
import nookies from 'nookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- INTERFACES (Alineadas con el Backend v9.2) ---

interface GrupoSegmento {
  id?: number; 
  dia: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM
  horaFin: string; // HH:MM
  grupoId: number;
}

interface GrupoData {
  id?: number; // Opcional para nuevos grupos
  cupoMaximo: number | string;
  capacitacionId: number;
  segmentos: GrupoSegmento[]; // Incluye la nueva estructura
}

interface CapacitacionData {
  id: number;
  nombre: string;
  descripcion: string;
  instructor: string;
  modalidad: 'Presencial' | 'Online';
  ubicacion: string;
  visible: boolean;
  grupos: GrupoData[]; // Incluye grupos con segmentos
}

type PageProps = {
  initialData: CapacitacionData | null;
  error?: string;
};

// --- HELPERS ---

// Helper para obtener la fecha y hora actual en formato YYYY-MM-DD
const getTodayDateString = (date = new Date()): string => {
  return date.toISOString().slice(0, 10); 
}


// Componente principal de Edición
const EditarCapacitacionPage = ({
  initialData,
  error: initialError,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { id } = router.query;
  const capacitacionId = typeof id === 'string' ? parseInt(id) : null;
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
        cupoMaximo: g.cupoMaximo, 
        // Formatear las fechas Date a strings locales (YYYY-MM-DD) para el input date
        segmentos: g.segmentos.map(s => ({
            ...s,
            dia: getTodayDateString(new Date(s.dia))
        }))
    })) || []
  );
  
  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);


  // --- MANEJADORES DE ESTADO (Capacitación) ---
  const handleCapacitacionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setCapacitacionData(prev => ({
        ...prev!,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  // --- MANEJADORES DE ESTADO (Grupos y Segmentos) ---
  
  // Modificar propiedad de Grupo (ej. cupoMaximo)
  const handleGroupPropertyChange = (groupIndex: number, value: string | number) => {
    const nuevosGrupos = [...grupos];
    nuevosGrupos[groupIndex].cupoMaximo = value;
    setGrupos(nuevosGrupos);
  };
  
  // Modificar propiedad de Segmento (dia, horaInicio, horaFin)
  const handleSegmentChange = (groupIndex: number, segmentIndex: number, field: keyof GrupoSegmento, value: string) => {
      const nuevosGrupos = [...grupos];
      const nuevosSegmentos = [...nuevosGrupos[groupIndex].segmentos];
      (nuevosSegmentos[segmentIndex] as any)[field] = value;
      nuevosGrupos[groupIndex].segmentos = nuevosSegmentos;
      
      setGrupos(nuevosGrupos);
  };

  const handleAddSegment = (groupIndex: number) => {
      const nuevosGrupos = [...grupos];
      nuevosGrupos[groupIndex].segmentos.push({
          dia: getTodayDateString(), 
          horaInicio: "09:00",
          horaFin: "17:00",
          grupoId: nuevosGrupos[groupIndex].id || 0, // 0 si es nuevo grupo
      });
      setGrupos(nuevosGrupos);
  };

  const handleRemoveSegment = (groupIndex: number, segmentIndex: number) => {
      const nuevosGrupos = [...grupos];
      
      if (nuevosGrupos[groupIndex].segmentos.length === 1) {
          toast.error('Cada grupo debe tener al menos un día de programación.');
          return;
      }
      
      nuevosGrupos[groupIndex].segmentos.splice(segmentIndex, 1);
      setGrupos(nuevosGrupos);
  };


  const handleAddGroup = () => {
    if (!capacitacionData) return;
    setGrupos([
      ...grupos,
      { 
        cupoMaximo: 20,
        capacitacionId: capacitacionData.id,
        segmentos: [{ dia: getTodayDateString(), horaInicio: "09:00", horaFin: "17:00", grupoId: 0 }],
      },
    ]);
  };

  const handleRemoveGroup = async (groupIndex: number) => {
    const grupo = grupos[groupIndex];
    
    // Si el grupo ya existe en DB (tiene ID), se debe eliminar con el endpoint DELETE
    if (grupo.id) {
        const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el Grupo ID #${grupo.id} y todas sus inscripciones?`);
        if (!confirmDelete) return;

        const toastId = toast.loading('Eliminando grupo...');
        try {
            await request(`/grupos/${grupo.id}`, { method: 'DELETE' });
            toast.success('Grupo eliminado permanentemente.', { id: toastId });
            
            // Eliminar de la lista local
            setGrupos(grupos.filter((_, i) => i !== groupIndex));
        } catch (err: any) {
            toast.error(err.message || 'Error al eliminar el grupo.', { id: toastId });
        }
    } else {
        // Si no tiene ID, es un grupo nuevo, solo se elimina del estado local
        // No permitimos eliminar el único grupo, aunque este control ya está en handleRemoveGroup
        if (grupos.length === 1) {
            toast.error('Debe haber al menos un grupo programado.');
            return;
        }
        setGrupos(grupos.filter((_, i) => i !== groupIndex));
    }
  };


  // --- MANEJADOR PRINCIPAL DE ENVÍO ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!capacitacionData || !capacitacionId) return;
    
    const toastId = toast.loading('Guardando cambios...');

    // 1. Validaciones
    if (capacitacionData.modalidad === 'Presencial' && !capacitacionData.ubicacion) {
        toast.error('Para la modalidad Presencial, la ubicación es obligatoria.', { id: toastId });
        return;
    }
    if (grupos.some(g => g.segmentos.length === 0)) {
         toast.error('Cada grupo debe tener al menos un día de programación.', { id: toastId });
         return;
    }

    try {
      // 2. PATCH: Actualizar la Capacitación principal (solo campos principales)
      const payloadCapacitacion = {
        nombre: capacitacionData.nombre,
        descripcion: capacitacionData.descripcion,
        instructor: capacitacionData.instructor,
        modalidad: capacitacionData.modalidad,
        ubicacion: capacitacionData.ubicacion,
        visible: capacitacionData.visible,
        // No enviamos grupos aquí para evitar la complejidad de la lógica anidada
      };
      
      await request(`/capacitaciones/${capacitacionId}`, {
        method: 'PATCH',
        body: payloadCapacitacion,
      });


      // 3. CRUD: Actualizar/Crear Grupos y sus Segmentos
      const grupoPromises = grupos.map((g) => {
          const payloadGrupo = {
              cupoMaximo: Number(g.cupoMaximo),
              capacitacionId: capacitacionData.id,
              // Mapeamos los segmentos para el formato de backend
              segmentos: g.segmentos.map(s => ({
                  dia: s.dia, 
                  horaInicio: s.horaInicio,
                  horaFin: s.horaFin,
              }))
          };

          if (g.id) {
              // Si tiene ID, es una actualización (PATCH), incluyendo segmentos
              return request(`/grupos/${g.id}`, { method: 'PATCH', body: payloadGrupo });
          } else {
              // Si no tiene ID, es un nuevo grupo (POST) con sus segmentos
              return request('/grupos', { method: 'POST', body: payloadGrupo });
          }
      });

      await Promise.all(grupoPromises);
      

      toast.success('Capacitación y grupos actualizados con éxito.', { id: toastId });
      router.push(`/admin/capacitaciones/${capacitacionId}`); 
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
            <Link href={`/admin/capacitaciones/${capacitacionId}`} className="flex items-center text-blue-600 hover:underline mb-4">
                <FaArrowLeft className="mr-2" /> Volver al Detalle
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Editar Capacitación: {capacitacionData.nombre}</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-6">
            
            {/* --- BLOQUE PRINCIPAL (SIN CAMBIOS RESPECTO A LA VERSIÓN BASE) --- */}
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
                        className="w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027] text-gray-900" 
                        required
                    />
                    <select
                        name="modalidad"
                        value={capacitacionData.modalidad}
                        onChange={handleCapacitacionChange}
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027] text-gray-900"
                />

                {/* Descripción */}
                <textarea
                    name="descripcion"
                    placeholder="Descripción detallada de la Capacitación"
                    value={capacitacionData.descripcion}
                    onChange={handleCapacitacionChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027] text-gray-900"
                />
            </div>

            
            {/* --- BLOQUE DE GRUPOS MÚLTIPLES (Fase 9.3: Edición con Segmentos) --- */}
            <div className="pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Editar / Añadir Grupos y Horarios</h2>
                
                {grupos.map((grupo, groupIndex) => (
                <div key={grupo.id || `new-${groupIndex}`} className="p-4 border border-blue-100 rounded-lg shadow-md mb-6 bg-blue-50 relative">
                    <div className="flex justify-between items-start mb-4 border-b pb-3">
                        <h3 className="text-lg font-bold text-gray-700">
                            Grupo {groupIndex + 1} {grupo.id ? `(ID: ${grupo.id})` : '(Nuevo)'}
                        </h3>
                        
                        <button
                            type="button"
                            onClick={() => handleRemoveGroup(groupIndex)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full"
                            title={grupo.id ? "Eliminar Grupo permanentemente" : "Cancelar nuevo grupo"}
                            disabled={loading || grupos.length === 1}
                        >
                            <FiTrash2 size={18} />
                        </button>
                    </div>

                    {/* Propiedad principal del Grupo: Cupo */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cupo Máximo *</label>
                        <input
                            type="number"
                            placeholder="Cupo Máximo"
                            value={grupo.cupoMaximo}
                            onChange={(e) => handleGroupPropertyChange(groupIndex, e.target.value)}
                            min="1"
                            className="p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-[#D80027] focus:border-[#D80027]"
                            required
                        />
                    </div>
                    
                    {/* Sub-Bloque: Segmentos (Días y Horarios) */}
                    <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center border-t pt-3 mt-4">
                        <FiClock className="mr-2" /> Días de Programación:
                    </h4>
                    
                    {grupo.segmentos.map((segmento, segmentIndex) => (
                        <div key={segmento.id || `new-seg-${groupIndex}-${segmentIndex}`} className="grid grid-cols-4 gap-3 mb-3 p-3 bg-white border border-gray-200 rounded-lg items-center">
                            
                            {/* Día */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Día *</label>
                                <input
                                    type="date"
                                    value={segmento.dia}
                                    onChange={(e) => handleSegmentChange(groupIndex, segmentIndex, 'dia', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    required
                                />
                            </div>

                            {/* Hora de Inicio */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Inicio *</label>
                                <input
                                    type="time"
                                    value={segmento.horaInicio}
                                    onChange={(e) => handleSegmentChange(groupIndex, segmentIndex, 'horaInicio', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    required
                                />
                            </div>

                            {/* Hora de Fin */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Fin *</label>
                                <input
                                    type="time"
                                    value={segmento.horaFin}
                                    onChange={(e) => handleSegmentChange(groupIndex, segmentIndex, 'horaFin', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    required
                                />
                            </div>
                            
                            {/* Botón de Remover Segmento */}
                            <button
                                type="button"
                                onClick={() => handleRemoveSegment(groupIndex, segmentIndex)}
                                className="mt-3 p-2 text-red-600 hover:bg-red-100 rounded-lg h-full self-start"
                                title="Eliminar día de programación"
                                disabled={loading || grupo.segmentos.length === 1}
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    ))}
                    
                    <button
                        type="button"
                        onClick={() => handleAddSegment(groupIndex)}
                        className="w-full flex justify-center items-center py-2 px-4 border border-dashed border-gray-400 rounded-lg text-gray-600 hover:bg-gray-100 mt-4 text-sm"
                    >
                        <FiPlus className="mr-2" />
                        Añadir Día / Segmento
                    </button>
                </div>
                ))}
                
                <button
                    type="button"
                    onClick={handleAddGroup}
                    className="w-full flex justify-center items-center py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 mt-6 border border-gray-300"
                    title="Añadir un nuevo grupo para esta capacitación"
                    disabled={loading}
                >
                    <FiPlus className="mr-2" />
                    Añadir Nuevo Grupo
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
                    disabled={loading}
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
  nookies.set(context, 'theme', 'dark');
  context.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { id } = context.params!;
  const token = context.req.cookies.token; // Obtener el token de las cookies

  if (!token) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  try {
    // Llamada al endpoint de admin (backend/src/capacitaciones/capacitaciones.controller.ts)
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
    
    return { 
      props: { 
        initialData: data
      } 
    };
  } catch (err) {
    return { props: { initialData: null, error: 'No se pudo conectar con el servidor de datos.' } };
  }
};