// frontend/src/pages/admin/capacitaciones/nueva.tsx

import React, { useState, FormEvent } from 'react';
import Head from 'next/head';
import { useApi } from '@/hooks/useApi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

// Helper para obtener la fecha y hora actual en formato YYYY-MM-DDTHH:mm
const getLocalDatetimeString = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000; 
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

// Interfaz para el estado de los datos de un Grupo
interface GrupoInput {
  fechaInicio: string;
  fechaFin: string;
  cupoMaximo: number | string;
}

// Interfaz para el estado de la Capacitación principal
interface CapacitacionForm {
  nombre: string;
  descripcion: string;
  instructor: string;
  modalidad: 'Presencial' | 'Online' | '';
  ubicacion: string; 
  visible: boolean;
}

export default function NuevaCapacitacionPage() {
  const router = useRouter();
  const { request, loading } = useApi();
  
  // Estado de la Capacitación
  const [capacitacionData, setCapacitacionData] = useState<CapacitacionForm>({
    nombre: '',
    descripcion: '',
    instructor: '',
    modalidad: '',
    ubicacion: '', 
    visible: true,
  });

  // Estado de Grupos (Array de Grupos)
  const [grupos, setGrupos] = useState<GrupoInput[]>([
    { // Grupo inicial
      fechaInicio: getLocalDatetimeString(), 
      fechaFin: getLocalDatetimeString(),
      cupoMaximo: 20,
    }
  ]);


  const handleCapacitacionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setCapacitacionData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleGroupChange = (index: number, field: keyof GrupoInput, value: string | number) => {
    const nuevosGrupos = [...grupos];
    (nuevosGrupos[index] as any)[field] = value;
    setGrupos(nuevosGrupos);
  };
  
  const handleAddGroup = () => {
    setGrupos([
      ...grupos,
      { fechaInicio: getLocalDatetimeString(), fechaFin: getLocalDatetimeString(), cupoMaximo: 20 },
    ]);
  };

  const handleRemoveGroup = (index: number) => {
    setGrupos(grupos.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Creando capacitación...');

    // Validaciones
    if (capacitacionData.modalidad === 'Presencial' && !capacitacionData.ubicacion) {
        toast.error('Para la modalidad Presencial, la ubicación es obligatoria.', { id: toastId });
        return;
    }
    if (grupos.length === 0) {
        toast.error('Debe crear al menos un grupo.', { id: toastId });
        return;
    }
    
    // Preparar el payload: mapear los grupos y asegurar los tipos
    try {
      const payload = {
        ...capacitacionData, 
        grupos: grupos.map((g) => ({
          ...g,
          fechaInicio: new Date(g.fechaInicio).toISOString(),
          fechaFin: new Date(g.fechaFin).toISOString(), 
          cupoMaximo: Number(g.cupoMaximo),
        })),
      };
      
      await request('/capacitaciones', {
        method: 'POST',
        body: payload,
      });

      toast.success('Capacitación y grupos creados con éxito.', { id: toastId });
      router.push('/admin/capacitaciones'); 
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la capacitación.', { id: toastId });
    }
  };

  return (
    // Se elimina AdminLayout para evitar el doble sidebar
    <>
      <Head>
        <title>Crear Nueva Capacitación - Admin</title>
      </Head>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Crear Nueva Capacitación</h1>
            <Link href="/admin/capacitaciones" className="text-blue-600 hover:underline">
                &larr; Cancelar y volver
            </Link>
        </div>
        
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
                  className="w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027] text-gray-700" // FIX: text-gray-700
                  required
                >
                  <option value="" disabled className="text-gray-400">Modalidad *</option>
                  <option value="Presencial" className="text-gray-900">Presencial</option>
                  <option value="Online" className="text-gray-900">Online</option>
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

          
          {/* --- BLOQUE DE GRUPOS MÚLTIPLES (R3) --- */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Grupos Programados</h2>
            
            {grupos.map((grupo, index) => (
              <div key={index} className="p-4 border border-gray-100 rounded-lg shadow-sm mb-4 relative bg-gray-50">
                <h3 className="text-md font-semibold text-gray-700 mb-3">Grupo {index + 1}</h3>
                
                {grupos.length > 1 && (
                    <button
                        type="button"
                        onClick={() => handleRemoveGroup(index)}
                        className="absolute top-4 right-4 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                        title="Eliminar Grupo"
                    >
                        <FiTrash2 size={18} />
                    </button>
                )}

                <div className="grid grid-cols-3 gap-4">
                  
                  {/* Fecha de Inicio (R1) */}
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

                  {/* Fecha de Fin (R1) */}
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
          

          {/* Visibilidad */}
          <div className="flex items-center pt-4 border-t border-gray-200 mt-4">
              <input
                  id="visible-create"
                  name="visible"
                  type="checkbox"
                  checked={capacitacionData.visible}
                  onChange={handleCapacitacionChange}
                  className="h-4 w-4 text-[#D80027] border-gray-300 rounded focus:ring-[#D80027]"
              />
              <label htmlFor="visible-create" className="ml-2 block text-sm text-gray-900">
                  Visible en el catálogo público
              </label>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#D80027] text-white font-semibold rounded-lg hover:bg-[#b80021] disabled:bg-gray-400 transition duration-150"
          >
            {loading ? 'Guardando...' : 'Crear Capacitación'}
          </button>
        </form>
      </div>
    </>
  );
}