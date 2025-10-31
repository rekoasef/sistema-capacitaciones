// frontend/src/pages/admin/capacitaciones/[id]/edit.tsx

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import nookies from 'nookies';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi'; // <-- 1. Importar iconos
import ConfirmModal from '@/components/ConfirmModal'; // <-- 2. Importar modal

// --- 3. Interfaces actualizadas ---
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
  grupos: Grupo[]; // <-- Ahora esperamos los grupos
}
type PageProps = {
  capacitacion: Capacitacion | null;
  error?: string;
};

// Interface para el estado de los formularios de grupos
interface GrupoInput {
  id: number; // El ID del grupo existente
  fechaInicio: string;
  fechaFin: string;
  cupoMaximo: string | number;
}
// Interface para el formulario de *nuevo* grupo
interface NuevoGrupoInput {
  fechaInicio: string;
  fechaFin: string;
  cupoMaximo: string | number;
}

// --- Función para formatear fecha a YYYY-MM-DDTHH:MM ---
const formatDateTimeLocal = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Ajustamos por la zona horaria local para que el input muestre la hora correcta
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};


export default function EditarCapacitacionPage({ capacitacion, error: initialError }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  
  // --- Estados del formulario principal (sin cambios) ---
  const [nombre, setNombre] = useState(capacitacion?.nombre || '');
  const [descripcion, setDescripcion] = useState(capacitacion?.descripcion || '');
  const [instructor, setInstructor] = useState(capacitacion?.instructor || '');
  const [modalidad, setModalidad] = useState(capacitacion?.modalidad || 'Presencial');
  
  // --- 4. Nuevos estados para la gestión de grupos ---
  const [grupos, setGrupos] = useState<GrupoInput[]>([]);
  const [nuevoGrupo, setNuevoGrupo] = useState<NuevoGrupoInput>({
    fechaInicio: '', fechaFin: '', cupoMaximo: 25,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [grupoParaEliminar, setGrupoParaEliminar] = useState<number | null>(null);

  const [error, setError] = useState(initialError || '');
  const [loading, setLoading] = useState(false); // Loading para el form principal
  const router = useRouter();
  const { id: capacitacionId } = router.query;

  // --- 5. Poblar el estado de los grupos ---
  useEffect(() => {
    if (capacitacion) {
      setNombre(capacitacion.nombre);
      setDescripcion(capacitacion.descripcion);
      setInstructor(capacitacion.instructor);
      setModalidad(capacitacion.modalidad);
      // Poblar el estado de grupos con formato de fecha correcto
      setGrupos(
        capacitacion.grupos.map(g => ({
          ...g,
          fechaInicio: formatDateTimeLocal(g.fechaInicio),
          fechaFin: formatDateTimeLocal(g.fechaFin),
        }))
      );
    }
  }, [capacitacion]);
  
  const handleSubmitPrincipal = async (event: FormEvent) => {
    // ... (El handleSubmit del form principal no cambia)
    event.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    const toastId = toast.loading('Actualizando capacitación...');
    const payload = { nombre, descripcion, instructor, modalidad };

    try {
      const response = await fetch(`http://127.0.0.1:3001/capacitaciones/${capacitacionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al actualizar.');
      toast.success('Capacitación actualizada con éxito', { id: toastId });
      router.push(`/admin/capacitaciones/${capacitacionId}`);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --- 6. Nuevos Handlers para el CRUD de Grupos ---

  // Refresca los datos de la página desde el servidor
  const refreshData = () => {
    router.replace(router.asPath); // Recarga getServerSideProps
  };
  
  // Maneja el cambio en un input de un grupo existente
  const handleGrupoChange = (index: number, field: keyof GrupoInput, value: string | number) => {
    const nuevosGrupos = [...grupos];
    (nuevosGrupos[index] as any)[field] = value;
    setGrupos(nuevosGrupos);
  };

  // Maneja el cambio en el formulario de "nuevo grupo"
  const handleNuevoGrupoChange = (field: keyof NuevoGrupoInput, value: string | number) => {
    setNuevoGrupo(prev => ({ ...prev, [field]: value }));
  };

  // POST /grupos
  const handleAddNewGrupo = async (event: FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const toastId = toast.loading('Añadiendo grupo...');
    try {
      const response = await fetch(`http://127.0.0.1:3001/grupos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({
          ...nuevoGrupo,
          cupoMaximo: Number(nuevoGrupo.cupoMaximo),
          capacitacionId: Number(capacitacionId),
        }),
      });
      if (!response.ok) throw new Error('No se pudo añadir el grupo.');
      toast.success('Grupo añadido', { id: toastId });
      setNuevoGrupo({ fechaInicio: '', fechaFin: '', cupoMaximo: 25 }); // Resetear form
      refreshData(); // Recargar los datos de la página
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  // PATCH /grupos/:id
  const handleUpdateGrupo = async (grupoId: number, index: number) => {
    const token = localStorage.getItem('token');
    const toastId = toast.loading('Actualizando grupo...');
    const grupo = grupos[index];
    
    try {
      const response = await fetch(`http://127.0.0.1:3001/grupos/${grupoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({
          fechaInicio: new Date(grupo.fechaInicio).toISOString(), // Convertir a ISO
          fechaFin: new Date(grupo.fechaFin).toISOString(),
          cupoMaximo: Number(grupo.cupoMaximo),
        }),
      });
      if (!response.ok) throw new Error('No se pudo actualizar el grupo.');
      toast.success('Grupo actualizado', { id: toastId });
      refreshData();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  // Abre el modal de confirmación
  const openDeleteModal = (id: number) => {
    setGrupoParaEliminar(id);
    setIsModalOpen(true);
  };
  
  // DELETE /grupos/:id
  const handleDeleteGrupo = async () => {
    if (!grupoParaEliminar) return;
    const token = localStorage.getItem('token');
    const toastId = toast.loading('Eliminando grupo...');
    
    try {
      const response = await fetch(`http://127.0.0.1:3001/grupos/${grupoParaEliminar}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`},
      });
      if (!response.ok) throw new Error('No se pudo eliminar el grupo.');
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
      
      {/* --- Formulario Principal --- */}
      <div className="container mx-auto max-w-2xl">
        <form onSubmit={handleSubmitPrincipal} className="p-8 space-y-6 bg-white rounded-2xl shadow-xl">
          {/* ... (campos de nombre, descripcion, instructor, modalidad igual que antes) ... */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input id="nombre" type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm" />
          </div>
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea id="descripcion" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} className="mt-1 block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm" />
          </div>
          <div>
            <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">Instructor</label>
            <input id="instructor" type="text" required value={instructor} onChange={(e) => setInstructor(e.target.value)} className="mt-1 block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm" />
          </div>
          <div>
            <label htmlFor="modalidad" className="block text-sm font-medium text-gray-700">Modalidad</label>
            <select id="modalidad" required value={modalidad} onChange={(e) => setModalidad(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-3 text-gray-900 border-gray-300 rounded-lg">
              <option>Presencial</option>
              <option>Virtual</option>
              <option>Híbrida</option>
            </select>
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#D80027] hover:bg-[#b80021] disabled:bg-gray-400">
              {loading ? 'Guardando...' : 'Guardar Cambios Principales'}
            </button>
          </div>
          {error && !initialError && <div className="p-4 text-center rounded-lg bg-red-100 text-red-800">{error}</div>}
        </form>

        {/* --- 7. NUEVA SECCIÓN: Gestión de Grupos --- */}
        <div className="p-8 mt-10 space-y-6 bg-white rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Grupos</h2>
          
          {/* --- Lista de Grupos Existentes --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Grupos Existentes</h3>
            {grupos.length > 0 ? grupos.map((grupo, index) => (
              <div key={grupo.id} className="p-4 border rounded-lg space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de Inicio</label>
                  <input type="datetime-local" required value={grupo.fechaInicio} onChange={(e) => handleGrupoChange(index, 'fechaInicio', e.target.value)} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de Fin</label>
                  <input type="datetime-local" required value={grupo.fechaFin} onChange={(e) => handleGrupoChange(index, 'fechaFin', e.target.value)} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Cupo Máximo</label>
                  <input type="number" required value={grupo.cupoMaximo} onChange={(e) => handleGrupoChange(index, 'cupoMaximo', e.target.value)} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md"/>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button onClick={() => openDeleteModal(grupo.id)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200">
                    <FiTrash2 className="inline mr-1"/> Eliminar
                  </button>
                  <button onClick={() => handleUpdateGrupo(grupo.id, index)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Actualizar Grupo
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-gray-500">No hay grupos existentes para esta capacitación.</p>
            )}
          </div>

          {/* --- Formulario de Nuevo Grupo --- */}
          <form onSubmit={handleAddNewGrupo} className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900">Añadir Nuevo Grupo</h3>
            <div className="p-4 border rounded-lg space-y-2 bg-gray-50">
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de Inicio</label>
                  <input type="datetime-local" required value={nuevoGrupo.fechaInicio} onChange={(e) => handleNuevoGrupoChange('fechaInicio', e.target.value)} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de Fin</label>
                  <input type="datetime-local" required value={nuevoGrupo.fechaFin} onChange={(e) => handleNuevoGrupoChange('fechaFin', e.target.value)} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Cupo Máximo</label>
                  <input type="number" required value={nuevoGrupo.cupoMaximo} onChange={(e) => handleNuevoGrupoChange('cupoMaximo', e.target.value)} className="mt-1 block w-full text-gray-900 border-gray-300 rounded-md"/>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                    <FiPlus className="inline mr-1"/> Añadir Grupo
                  </button>
                </div>
              </div>
          </form>

        </div>
      </div>
      
      {/* --- 8. Modal de Confirmación para eliminar grupos --- */}
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

// --- 9. getServerSideProps actualizado para pasar los grupos ---
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const cookies = nookies.get(context);
  const token = cookies.token;

  if (!token) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  const { id } = context.params!; 

  try {
    const resCap = await fetch(`http://127.0.0.1:3001/capacitaciones/admin/${id}`, {
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
    
    // ¡AHORA SÍ PASAMOS LA CAPACITACIÓN COMPLETA!
    const dataCap = await resCap.json();

    return { 
      props: { 
        capacitacion: dataCap // Contiene .id, .nombre, .grupos, etc.
      } 
    };

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