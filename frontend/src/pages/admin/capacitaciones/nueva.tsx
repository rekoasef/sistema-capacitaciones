// frontend/src/pages/admin/capacitaciones/nueva.tsx

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// Definimos la forma de un objeto Grupo para nuestro estado
interface GrupoInput {
  fechaInicio: string;
  fechaFin: string;
  cupoMaximo: number;
}

export default function NuevaCapacitacionPage() {
  // Estados para la capacitación principal
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [instructor, setInstructor] = useState('');
  const [modalidad, setModalidad] = useState('Presencial');
  
  // --- ¡NUEVA LÓGICA DINÁMICA! ---
  const [conCupos, setConCupos] = useState(true); // Estado para el interruptor de cupos
  const [grupos, setGrupos] = useState<GrupoInput[]>([
    { fechaInicio: '', fechaFin: '', cupoMaximo: 25 }, // Empezamos con un grupo por defecto
  ]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- Funciones para manejar los grupos dinámicos ---
  const handleAddGrupo = () => {
    setGrupos([...grupos, { fechaInicio: '', fechaFin: '', cupoMaximo: 25 }]);
  };

  const handleRemoveGrupo = (index: number) => {
    const nuevosGrupos = grupos.filter((_, i) => i !== index);
    setGrupos(nuevosGrupos);
  };
  
  const handleGrupoChange = (index: number, field: keyof GrupoInput, value: string | number) => {
    const nuevosGrupos = [...grupos];
    (nuevosGrupos[index] as any)[field] = value;
    setGrupos(nuevosGrupos);
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    // Preparamos los datos para enviar
    const payload = {
      nombre,
      descripcion,
      instructor,
      modalidad,
      // Si el interruptor de cupos está apagado, enviamos un array vacío
      grupos: conCupos ? grupos.map(g => ({...g, cupoMaximo: Number(g.cupoMaximo)})) : [],
    };

    // **NOTA:** Esta petición fallará por ahora, ¡y es normal!
    // En el siguiente paso, modificaremos el backend para que acepte este nuevo formato.
    try {
      const response = await fetch('http://localhost:3001/capacitaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la capacitación.');
      }

      router.push('/admin/capacitaciones');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Crear Nueva Capacitación</h1>
        <Link href="/admin/capacitaciones" className="text-blue-600 hover:underline">
          &larr; Volver al listado
        </Link>
      </header>
      
      <div className="container mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white rounded-2xl shadow-xl">
          {/* --- CAMPOS PRINCIPALES --- */}
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
            {/* SOLUCIÓN: Añadimos 'text-gray-900' */}
            <select id="modalidad" required value={modalidad} onChange={(e) => setModalidad(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-3 text-gray-900 border-gray-300 rounded-lg">
              <option>Presencial</option>
              <option>Virtual</option>
              <option>Híbrida</option>
            </select>
          </div>

          {/* --- INTERRUPTOR DE CUPOS --- */}
          <div className="flex items-center">
            <input id="conCupos" type="checkbox" checked={conCupos} onChange={(e) => setConCupos(e.target.checked)} className="h-4 w-4 text-[#D80027] border-gray-300 rounded" />
            <label htmlFor="conCupos" className="ml-2 block text-sm text-gray-900">Gestionar cupos y grupos para esta capacitación</label>
          </div>

          {/* --- SECCIÓN DINÁMICA DE GRUPOS --- */}
          {conCupos && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900">Grupos Programados</h3>
              {grupos.map((grupo, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2 relative">
                   {grupos.length > 1 && (
                     <button type="button" onClick={() => handleRemoveGrupo(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600">&times;</button>
                   )}
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
                </div>
              ))}
              <button type="button" onClick={handleAddGrupo} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                + Añadir otro grupo
              </button>
            </div>
          )}

          {/* --- BOTÓN DE ENVÍO --- */}
          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#D80027] hover:bg-[#b80021] disabled:bg-gray-400">
              {loading ? 'Guardando...' : 'Guardar Capacitación'}
            </button>
          </div>

          {error && <div className="p-4 text-center rounded-lg bg-red-100 text-red-800">{error}</div>}
        </form>
      </div>
    </main>
  );
}