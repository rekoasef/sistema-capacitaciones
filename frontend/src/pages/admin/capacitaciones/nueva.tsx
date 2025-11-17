// frontend/src/pages/admin/capacitaciones/nueva.tsx

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useApi } from '@/hooks/useApi'; // <-- 1. IMPORTAR EL HOOK

// Interface para el formulario de un grupo
interface GrupoInput {
  fechaInicio: string;
  fechaFin: string;
  cupoMaximo: number | string;
}

export default function NuevaCapacitacionPage() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [instructor, setInstructor] = useState('');
  const [modalidad, setModalidad] = useState('Presencial');
  const [grupos, setGrupos] = useState<GrupoInput[]>([]);
  
  // 2. Usar el hook useApi
  const { request, loading: apiLoading } = useApi();
  const router = useRouter();

  const handleAddGrupo = () => {
    setGrupos([
      ...grupos,
      { fechaInicio: '', fechaFin: '', cupoMaximo: 25 },
    ]);
  };

  const handleRemoveGrupo = (index: number) => {
    setGrupos(grupos.filter((_, i) => i !== index));
  };

  const handleGrupoChange = (
    index: number,
    field: keyof GrupoInput,
    value: string | number,
  ) => {
    const nuevosGrupos = [...grupos];
    // Usamos 'as any' para bypassear el type-checking
    (nuevosGrupos[index] as any)[field] = value;
    setGrupos(nuevosGrupos);
  };

  // --- handleSubmit (REFACTORIZADO) ---
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const toastId = toast.loading('Creando capacitación...');

    const payload = {
      nombre,
      descripcion,
      instructor,
      modalidad,
      // Asegurarse de que los grupos tengan el formato correcto
      grupos: grupos.map((g) => ({
        ...g,
        fechaInicio: new Date(g.fechaInicio).toISOString(),
        fechaFin: new Date(g.fechaFin).toISOString(),
        cupoMaximo: Number(g.cupoMaximo),
      })),
    };

    try {
      // 3. Usamos el hook
      await request('/capacitaciones', {
        method: 'POST',
        body: payload,
      });

      toast.success('Capacitación creada con éxito', { id: toastId });
      router.push('/admin/capacitaciones'); // Redirigir a la lista
    } catch (err: any) {
      // El hook ya maneja el 401, solo mostramos el error
      toast.error(err.message, { id: toastId });
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Crear Nueva Capacitación</h1>
        <Link href="/admin/capacitaciones" className="text-blue-600 hover:underline">
          &larr; Cancelar y volver
        </Link>
      </header>
      
      <div className="container mx-auto max-w-2xl">
        {/* 4. Deshabilitar el formulario si el hook está 'loading' */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white rounded-2xl shadow-xl">
          <fieldset disabled={apiLoading} className="space-y-6">
            {/* --- CAMPOS PRINCIPALES --- */}
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

            {/* --- SECCIÓN DE GRUPOS --- */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800">Grupos Programados</h2>
              {grupos.map((grupo, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2 relative bg-gray-50">
                  <h3 className="text-md font-semibold text-gray-700">Grupo {index + 1}</h3>
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
                  <button
                    type="button"
                    onClick={() => handleRemoveGrupo(index)}
                    className="absolute top-4 right-4 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                    title="Eliminar Grupo"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddGrupo}
                className="w-full flex justify-center items-center py-2 px-4 border border-dashed border-gray-400 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <FiPlus className="mr-2" />
                Añadir Grupo
              </button>
            </div>

            {/* --- BOTÓN DE ENVÍO --- */}
            <div>
              <button type="submit" disabled={apiLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#D80027] hover:bg-[#b80021] disabled:bg-gray-400">
                {apiLoading ? 'Creando...' : 'Crear Capacitación'}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </main>
  );
}