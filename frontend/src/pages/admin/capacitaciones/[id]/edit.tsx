// frontend/src/pages/admin/capacitaciones/[id]/edit.tsx

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import nookies from 'nookies';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '@/components/ConfirmModal';
import { useApi } from '@/hooks/useApi'; // <-- 1. IMPORTAR EL HOOK

// --- ¡AQUÍ ESTÁ EL CAMBIO! ---
// 2. Definimos la URL base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- Interfaces (se mantienen igual) ---
interface Grupo {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  cupoMaximo: number;
}
interface Capacitacion {
  id: number;
  nombre: string;
  descripcion: string;
  instructor: string;
  modalidad: string;
  grupos: Grupo[];
}
type PageProps = {
  capacitacion: Capacitacion | null;
  error?: string;
};
interface GrupoInput {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  cupoMaximo: string | number;
}
interface NuevoGrupoInput {
  fechaInicio: string;
  fechaFin: string;
  cupoMaximo: string | number;
}
const formatDateTimeLocal = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};


export default function EditarCapacitacionPage({ capacitacion, error: initialError }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  
  // --- Estados del formulario principal ---
  const [nombre, setNombre] = useState(capacitacion?.nombre || '');
  const [descripcion, setDescripcion] = useState(capacitacion?.descripcion || '');
  const [instructor, setInstructor] = useState(capacitacion?.instructor || '');
  const [modalidad, setModalidad] = useState(capacitacion?.modalidad || 'Presencial');
  
  // --- Estados de grupos ---
  const [grupos, setGrupos] = useState<GrupoInput[]>([]);
  const [nuevoGrupo, setNuevoGrupo] = useState<NuevoGrupoInput>({
    fechaInicio: '', fechaFin: '', cupoMaximo: 25,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [grupoParaEliminar, setGrupoParaEliminar] = useState<number | null>(null);

  const [error, setError] = useState(initialError || '');
  const router = useRouter();
  const { id: capacitacionId } = router.query;
  
  // 3. Usar el hook useApi
  const { request, loading: apiLoading } = useApi();

  useEffect(() => {
    if (capacitacion) {
      setNombre(capacitacion.nombre);
      setDescripcion(capacitacion.descripcion);
      setInstructor(capacitacion.instructor);
      setModalidad(capacitacion.modalidad);
      setGrupos(
        capacitacion.grupos.map(g => ({
          ...g,
          fechaInicio: formatDateTimeLocal(g.fechaInicio),
          fechaFin: formatDateTimeLocal(g.fechaFin),
        }))
      );
    }
  }, [capacitacion]);
  
  // --- handleSubmitPrincipal (REFACTORIZADO) ---
  const handleSubmitPrincipal = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const toastId = toast.loading('Actualizando capacitación...');
    const payload = { nombre, descripcion, instructor, modalidad };

    try {
      // 4. Usamos el hook
      await request(`/capacitaciones/${capacitacionId}`, {
        method: 'PATCH',
        body: payload,
      });
      toast.success('Capacitación actualizada con éxito', { id: toastId });
      router.push(`/admin/capacitaciones/${capacitacionId}`);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: toastId });
    }
  };

  // --- Handlers de Grupos (REFACTORIZADOS) ---
  const refreshData = () => {
    router.replace(router.asPath);
  };
  
  const handleGrupoChange = (index: number, field: keyof GrupoInput, value: string | number) => {
    const nuevosGrupos = [...grupos];
    (nuevosGrupos[index] as any)[field] = value;
    setGrupos(nuevosGrupos);
  };

  const handleNuevoGrupoChange = (field: keyof NuevoGrupoInput, value: string | number) => {
    setNuevoGrupo(prev => ({ ...prev, [field]: value }));
  };

  // POST /grupos (Refactorizado)
  const handleAddNewGrupo = async (event: FormEvent) => {
    event.preventDefault();
    const toastId = toast.loading('Añadiendo grupo...');
    try {
      // 5. Usamos el hook
      await request('/grupos', {
        method: 'POST',
        body: {
          ...nuevoGrupo,
          cupoMaximo: Number(nuevoGrupo.cupoMaximo),
          capacitacionId: Number(capacitacionId),
        }
      });
      toast.success('Grupo añadido', { id: toastId });
      setNuevoGrupo({ fechaInicio: '', fechaFin: '', cupoMaximo: 25 });
      refreshData();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  // PATCH /grupos/:id (Refactorizado)
  const handleUpdateGrupo = async (grupoId: number, index: number) => {
    const toastId = toast.loading('Actualizando grupo...');
    const grupo = grupos[index];
    
    try {
      // 6. Usamos el hook
      await request(`/grupos/${grupoId}`, {
        method: 'PATCH',
        body: {
          fechaInicio: new Date(grupo.fechaInicio).toISOString(),
          fechaFin: new Date(grupo.fechaFin).toISOString(),
          cupoMaximo: Number(grupo.cupoMaximo),
        }
      });
      toast.success('Grupo actualizado', { id: toastId });
      refreshData();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const openDeleteModal = (id: number) => {
    setGrupoParaEliminar(id);
    setIsModalOpen(true);
  };
  
  // DELETE /grupos/:id (Refactorizado)
  const handleDeleteGrupo = async () => {
    if (!grupoParaEliminar) return;
    const toastId = toast.loading('Eliminando grupo...');
    
    try {
      // 7. Usamos el hook
      await request(`/grupos/${grupoParaEliminar}`, {
        method: 'DELETE',
      });
      toast.success('Grupo eliminado', { id: toastId });
      refreshData();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsModalOpen(false);
      setGrupoParaEliminar(null);
    }
  };


  if (error) { /* ... (manejo de error igual que antes) ... */ }
  if (!capacitacion) { /* ... (estado de carga igual que antes) ... */ }

  return (
    <main className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Editar Capacitación</h1>
        <Link href={`/admin/capacitaciones/${capacitacionId}`} className="text-blue-600 hover:underline">
          &larr; Cancelar y volver al detalle
        </Link>
      </header>
      
      {/* 8. Deshabilitar formularios si el hook está 'loading' */}
      <div className="container mx-auto max-w-2xl">
        <form onSubmit={handleSubmitPrincipal} className="p-8 space-y-6 bg-white rounded-2xl shadow-xl">
          <fieldset disabled={apiLoading} className="space-y-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input id="nombre" type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm disabled:bg-gray-100" />
            </div>
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea id="descripcion" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} className="mt-1 block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm disabled:bg-gray-100" />
            </div>
            <div>
              <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">Instructor</label>
              <input id="instructor" type="text" required value={instructor} onChange={(e) => setInstructor(e.target.value)} className="mt-1 block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm disabled:bg-gray-100" />
            </div>
            <div>
              <label htmlFor="modalidad" className="block text-sm font-medium text-gray-700">Modalidad</label>
              <select id="modalidad" required value={modalidad} onChange={(e) => setModalidad(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-3 text-gray-900 border-gray-300 rounded-lg disabled:bg-gray-100">
                <option>Presencial</option>
                <option>Virtual</option>
                <option>Híbrida</option>
              </select>
            </div>
            <div>
              <button type="submit" disabled={apiLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#D80027] hover:bg-[#b80021] disabled:bg-gray-400">
                {apiLoading ? 'Guardando...' : 'Guardar Cambios Principales'}
              </button>
            </div>
            {error && !initialError && <div className="p-4 text-center rounded-lg bg-red-100 text-red-800">{error}</div>}
          </fieldset>
        </form>

        {/* --- Gestión de Grupos (Deshabilitada si 'apiLoading') --- */}
        <div className="p-8 mt-10 space-y-6 bg-white rounded-2xl shadow-xl">
          <fieldset disabled={apiLoading} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Grupos</h2>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Grupos Existentes</h3>
              {grupos.length > 0 ? grupos.map((grupo, index) => (
                <div key={grupo.id} className="p-4 border rounded-lg space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha de Inicio</label>
                    <input type="datetime-local" required value={grupo.fechaInicio} onChange={(e) => handleGrupoChange(index, 'fechaInicio', e.target.value)} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md disabled:bg-gray-100"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha de Fin</label>
                    <input type="datetime-local" required value={grupo.fechaFin} onChange={(e) => handleGrupoChange(index, 'fechaFin', e.target.value)} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md disabled:bg-gray-100"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Cupo Máximo</label>
                    <input type="number" required value={grupo.cupoMaximo} onChange={(e) => handleGrupoChange(index, 'cupoMaximo', e.target.value)} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md disabled:bg-gray-100"/>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button onClick={() => openDeleteModal(grupo.id)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 disabled:bg-gray-100" disabled={apiLoading}>
                      <FiTrash2 className="inline mr-1"/> Eliminar
                    </button>
                    <button onClick={() => handleUpdateGrupo(grupo.id, index)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400" disabled={apiLoading}>
                      Actualizar Grupo
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500">No hay grupos existentes para esta capacitación.</p>
              )}
            </div>
          </fieldset>
          
          <form onSubmit={handleAddNewGrupo} className="space-y-4 border-t pt-4">
            <fieldset disabled={apiLoading} className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Añadir Nuevo Grupo</h3>
              <div className="p-4 border rounded-lg space-y-2 bg-gray-50">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha de Inicio</label>
                    <input type="datetime-local" required value={nuevoGrupo.fechaInicio} onChange={(e) => handleNuevoGrupoChange('fechaInicio', e.target.value)} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md disabled:bg-gray-100"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha de Fin</label>
                    <input type="datetime-local" required value={nuevoGrupo.fechaFin} onChange={(e) => handleNuevoGrupoChange('fechaFin', e.target.value)} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md disabled:bg-gray-100"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Cupo Máximo</label>
                    <input type="number" required value={nuevoGrupo.cupoMaximo} onChange={(e) => handleNuevoGrupoChange('cupoMaximo', e.target.value)} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md disabled:bg-gray-100"/>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400" disabled={apiLoading}>
                      <FiPlus className="inline mr-1"/> {apiLoading ? 'Añadiendo...' : 'Añadir Grupo'}
                    </button>
                  </div>
                </div>
            </fieldset>
          </form>

        </div>
      </div>
      
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteGrupo}
        title="¿Eliminar Grupo?"
        message="¿Estás seguro? Esta acción borrará permanentemente este grupo y todas sus inscripciones asociadas. No se puede deshacer."
        confirmText="Sí, Eliminar"
      />
    </main>
  );
}

// --- getServerSideProps (MODIFICADO) ---
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const cookies = nookies.get(context);
  const token = cookies.token;
  if (!token) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  const { id } = context.params!; 
  try {
    // 9. Usamos la variable API_BASE_URL
    const resCap = await fetch(`${API_BASE_URL}/capacitaciones/admin/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resCap.status === 401) {
      nookies.destroy(context, 'token', { path: '/' });
      return { redirect: { destination: '/admin/login', permanent: false } };
    }
    if (resCap.status === 404) {
      return { notFound: true };
    }
    if (!resCap.ok) {
      throw new Error(`Error ${resCap.status} al cargar la capacitación.`);
    }
    const dataCap = await resCap.json();
    return { props: { capacitacion: dataCap } };
  } catch (err: any) {
    console.error(`SSR DEBUG: Error fetching data in admin/edit.tsx for ID ${id}:`, err);
    return { 
      props: { 
        capacitacion: null, 
        error: 'No se pudo conectar al servidor para cargar los datos.' 
      } 
    };
  }
};