// frontend/src/pages/admin/capacitaciones/[id]/edit.tsx

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '@/components/AdminLayout';
import { useApi } from '@/hooks/useApi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// Interfaz de datos para la Capacitación
interface CapacitacionData {
  id: number;
  nombre: string;
  descripcion: string;
  instructor: string;
  modalidad: 'Presencial' | 'Online';
  ubicacion: string; // <-- NUEVO CAMPO (R6)
  visible: boolean;
}

// Interfaz para las props
type PageProps = {
  initialData: CapacitacionData | null;
  error?: string;
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

  // Estado del formulario: Utilizamos los datos iniciales
  const [formData, setFormData] = useState<CapacitacionData | null>(initialData);

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);


  // Si la data inicial es nula y no hay error, mostrar cargando.
  if (!formData && !error) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">Cargando datos de la capacitación...</div>
      </AdminLayout>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <AdminLayout>
        <div className="p-8 text-red-500 bg-red-100 rounded-lg max-w-4xl mx-auto my-8">
          Error: {error}
          <div className="mt-4"><Link href="/admin/capacitaciones" className="text-blue-600 hover:underline">Volver a la lista</Link></div>
        </div>
      </AdminLayout>
    );
  }
  
  // Si la data es nula (a pesar del chequeo inicial)
  if (!formData) return null;


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
        ...prev!,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Guardando cambios...');

    // Validaciones
    if (!formData.nombre || !formData.modalidad || !formData.ubicacion) {
        toast.error('Por favor, complete todos los campos obligatorios.', { id: toastId });
        return;
    }
    if (formData.modalidad === 'Presencial' && !formData.ubicacion) {
        toast.error('Para la modalidad Presencial, la ubicación es obligatoria.', { id: toastId });
        return;
    }

    // El payload debe coincidir con UpdateCapacitacionDto (parcial)
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        instructor: formData.instructor,
        modalidad: formData.modalidad,
        ubicacion: formData.ubicacion, // <-- Se incluye la ubicación
        visible: formData.visible,
        // No se envían grupos aquí, se manejan en la vista de detalle
      };
      
      await request(`/capacitaciones/${id}`, {
        method: 'PATCH', // Usamos PATCH para actualización parcial
        body: payload,
      });

      toast.success('Capacitación actualizada con éxito.', { id: toastId });
      router.push(`/admin/capacitaciones/${id}`); // Redirigir a la vista de detalle
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la capacitación.', { id: toastId });
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Editar {formData.nombre} - Admin</title>
      </Head>
      <div className="max-w-4xl mx-auto py-8">
         <Link href={`/admin/capacitaciones/${id}`} className="flex items-center text-blue-600 hover:underline mb-4">
            <FaArrowLeft className="mr-2" /> Volver al Detalle
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Editar Capacitación: {formData.nombre}</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          
          {/* Nombre y Modalidad */}
          <div className="flex space-x-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre de la Capacitación *"
              value={formData.nombre}
              onChange={handleChange}
              className="w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027]"
              required
            />
            <select
              name="modalidad"
              value={formData.modalidad}
              onChange={handleChange}
              className="w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027]"
              required
            >
              <option value="Presencial">Presencial</option>
              <option value="Online">Online</option>
            </select>
          </div>
          
          {/* Ubicación (R6) */}
          {formData.modalidad === 'Presencial' && (
            <input
              type="text"
              name="ubicacion"
              placeholder="Ubicación (Dirección o Lugar) *"
              value={formData.ubicacion}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027]"
              required
            />
          )}
          
          {/* Instructor */}
           <input
            type="text"
            name="instructor"
            placeholder="Instructor / Responsable"
            value={formData.instructor}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027]"
          />

          {/* Descripción */}
          <textarea
            name="descripcion"
            placeholder="Descripción detallada de la Capacitación"
            value={formData.descripcion}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#D80027] focus:border-[#D80027]"
          />
          
          {/* Visibilidad */}
          <div className="flex items-center pt-4">
              <input
                  id="visible"
                  name="visible"
                  type="checkbox"
                  checked={formData.visible}
                  onChange={handleChange}
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
    </AdminLayout>
  );
};

export default EditarCapacitacionPage;


// getServerSideProps para cargar la data inicial
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  context.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { id } = context.params!;
  const token = context.req.cookies.token; // Obtener el token de las cookies

  if (!token) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/capacitaciones/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 404) {
      return { notFound: true };
    }
    
    if (!res.ok) {
        // Error de servidor o token inválido
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