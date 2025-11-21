// frontend/src/pages/admin/capacitaciones/nueva.tsx

import React, { useState, FormEvent } from 'react';
import Head from 'next/head';
import { useApi } from '@/hooks/useApi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { FiPlus, FiTrash2, FiClock } from 'react-icons/fi';
import nookies from 'nookies';
import { GetServerSideProps } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- INTERFACES ---

interface GrupoSegmento {
  dia: string;      // YYYY-MM-DD
  horaInicio: string; // HH:MM
  horaFin: string;    // HH:MM
}

interface GrupoData {
  cupoMaximo: number | string;
  segmentos: GrupoSegmento[];
}

interface CapacitacionData {
  nombre: string;
  descripcion: string;
  instructor: string;
  modalidad: 'Presencial' | 'Online';
  ubicacion: string;
  visible: boolean;
}

// Interfaz para el objeto de respuesta del backend que contiene el ID
interface CreatedResource {
    id: number;
    [key: string]: any; 
}

// --- HELPERS PARA FECHAS Y HORAS ---

// Obtiene solo la parte de la fecha (YYYY-MM-DD)
const getTodayDateString = (date = new Date()): string => {
    return date.toISOString().slice(0, 10); 
}

// Componente principal de Creación
const NuevaCapacitacionPage = () => {
  const router = useRouter();
  const { request, loading } = useApi();
  
  // 1. Estado inicial de la Capacitación
  const [capacitacionData, setCapacitacionData] = useState<CapacitacionData>({
    nombre: '',
    descripcion: '',
    instructor: '',
    modalidad: 'Presencial',
    ubicacion: '',
    visible: true,
  });

  // 2. Estado inicial de Grupos y Segmentos
  const [grupos, setGrupos] = useState<GrupoData[]>([
    { // Inicializamos con un grupo y un segmento por defecto
      cupoMaximo: 20,
      segmentos: [{ dia: getTodayDateString(), horaInicio: "09:00", horaFin: "17:00" }],
    },
  ]);


  // --- MANEJADORES DE ESTADO ---

  const handleCapacitacionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setCapacitacionData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleGroupPropertyChange = (groupIndex: number, field: keyof GrupoData, value: string | number) => {
    const nuevosGrupos = [...grupos];
    (nuevosGrupos[groupIndex] as any)[field] = value;
    setGrupos(nuevosGrupos);
  };
  
  const handleSegmentChange = (groupIndex: number, segmentIndex: number, field: keyof GrupoSegmento, value: string) => {
      const nuevosGrupos = [...grupos];
      (nuevosGrupos[groupIndex].segmentos[segmentIndex] as any)[field] = value;
      setGrupos(nuevosGrupos);
  };

  const handleAddSegment = (groupIndex: number) => {
      const nuevosGrupos = [...grupos];
      nuevosGrupos[groupIndex].segmentos.push({
          dia: getTodayDateString(), 
          horaInicio: "09:00",
          horaFin: "17:00",
      });
      setGrupos(nuevosGrupos);
  };

  const handleRemoveSegment = (groupIndex: number, segmentIndex: number) => {
      const nuevosGrupos = [...grupos];
      nuevosGrupos[groupIndex].segmentos.splice(segmentIndex, 1);
      setGrupos(nuevosGrupos);
  };

  const handleAddGroup = () => {
    setGrupos([
      ...grupos,
      { // Nuevo grupo
        cupoMaximo: 20,
        // Segmento por defecto para empezar
        segmentos: [{ dia: getTodayDateString(), horaInicio: "09:00", horaFin: "17:00" }], 
      },
    ]);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    // No permitimos eliminar el único grupo
    if (grupos.length === 1) {
        toast.error('Debe haber al menos un grupo programado.');
        return;
    }
    setGrupos(grupos.filter((_, i) => i !== groupIndex));
  };


  // --- MANEJADOR PRINCIPAL DE ENVÍO ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const toastId = toast.loading('Creando nueva capacitación...');

    // 1. Validaciones
    if (!capacitacionData.nombre || !capacitacionData.modalidad) {
        toast.error('El nombre y la modalidad son obligatorios.', { id: toastId });
        return;
    }
    if (capacitacionData.modalidad === 'Presencial' && !capacitacionData.ubicacion) {
        toast.error('Para la modalidad Presencial, la ubicación es obligatoria.', { id: toastId });
        return;
    }
    // Validar que cada grupo tenga al menos un segmento
    if (grupos.some(g => g.segmentos.length === 0)) {
         toast.error('Cada grupo debe tener al menos un día de programación.', { id: toastId });
         return;
    }
    
    try {
      // 2. Preparar Payload 
      const gruposPayload = grupos.map(g => ({
          cupoMaximo: Number(g.cupoMaximo),
          // Mapeamos los segmentos para asegurar el formato correcto
          segmentos: g.segmentos.map(s => ({
              dia: s.dia, // YYYY-MM-DD
              horaInicio: s.horaInicio,
              horaFin: s.horaFin,
          }))
      }));

      const finalPayload = {
        ...capacitacionData,
        grupos: gruposPayload,
      };
      
      // Tipamos la respuesta de la función para asegurar el ID
      const newCapacitacion = await request<CreatedResource>(`/capacitaciones`, { 
        method: 'POST',
        body: finalPayload,
      });

      toast.success('Capacitación creada con éxito.', { id: toastId });
      
      // *** CORRECCIÓN CRÍTICA: Uso de Backticks (`) para Template Literal ***
      //@ts-ignore
      router.push(`/admin/capacitaciones/${newCapacitacion.id}`); 
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al crear la capacitación.', { id: toastId });
    }
  };


  return (
    <>
        <Head>
            <title>Nueva Capacitación - Admin</title>
        </Head>
        <div className="max-w-4xl mx-auto py-8">
            <Link href="/admin/capacitaciones" className="flex items-center text-blue-600 hover:underline mb-4">
                <FaArrowLeft className="mr-2" /> Volver a la Lista
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Crear Nueva Capacitación</h1>
            
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

            
            {/* --- BLOQUE DE GRUPOS MÚLTIPLES (R4: Creación de Grupos con Segmentos) --- */}
            <div className="pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Grupos y Horarios por Día</h2>
                
                {grupos.map((grupo, groupIndex) => (
                <div key={groupIndex} className="p-4 border border-blue-100 rounded-lg shadow-md mb-6 bg-blue-50 relative">
                    <div className="flex justify-between items-start mb-4 border-b pb-3">
                        <h3 className="text-lg font-bold text-gray-700">
                            Grupo {groupIndex + 1} (Nuevo)
                        </h3>
                        
                        <button
                            type="button"
                            onClick={() => handleRemoveGroup(groupIndex)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full"
                            title="Eliminar este grupo"
                            disabled={grupos.length === 1}
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
                            onChange={(e) => handleGroupPropertyChange(groupIndex, 'cupoMaximo', e.target.value)}
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
                        <div key={segmentIndex} className="grid grid-cols-4 gap-3 mb-3 p-3 bg-white border border-gray-200 rounded-lg items-center">
                            
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
                                className="mt-3 p-2 text-red-600 hover:bg-red-100 rounded-lg h-full"
                                title="Eliminar día de programación"
                                disabled={grupo.segmentos.length === 1}
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
                {loading ? 'Creando...' : 'Crear Capacitación'}
            </button>
            </form>
        </div>
    </>
  );
};

export default NuevaCapacitacionPage;

// getServerSideProps para protección de ruta de administrador
export const getServerSideProps: GetServerSideProps = async (context) => {
    const cookies = nookies.get(context);
    const token = cookies.token;
    if (!token) {
        return { redirect: { destination: '/admin/login', permanent: false } };
    }
    return { props: {} };
};