// frontend/src/pages/capacitaciones/[id].tsx

import { useState, FormEvent } from 'react';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast'; 

// --- ¡AQUÍ ESTÁ EL CAMBIO! ---
// 1. Definimos la URL base de la API usando la variable de entorno.
//    Esto funcionará tanto en el servidor (getServerSideProps) como en el cliente (handleSubmit).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- Interfaces (se mantienen igual) ---
interface Capacitacion { id: number; nombre: string; descripcion: string; instructor: string; }
interface Grupo { id: number; fechaInicio: string; cupoMaximo: number; capacitacionId: number; cuposRestantes: number; }
interface Concesionario { id: number; nombre: string; }
type PageProps = { capacitacion: Capacitacion | null; grupos: Grupo[]; concesionarios: Concesionario[]; };

export default function CapacitacionDetallePage({ capacitacion, grupos, concesionarios }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombreUsuario: '', emailUsuario: '', telefono: '', concesionarioId: '', informacionAdicional: '', grupoId: '',
  });
  
  const [loading, setLoading] = useState(false);

  if (!capacitacion) {
    // ... (Manejo de 404 sin cambios)
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">404 - Capacitación no encontrada</h1>
          <Link href="/" className="text-blue-600 hover:underline mt-4 block">
            &larr; Volver a todas las capacitaciones
          </Link>
        </div>
      </main>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- handleSubmit (MODIFICADO) ---
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    
    const toastId = toast.loading('Inscribiendo...');

    try {
      // 2. Usamos la variable API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/inscripciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          grupoId: parseInt(formData.grupoId),
          concesionarioId: parseInt(formData.concesionarioId),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Ocurrió un error.');
      
      toast.success('¡Inscripción exitosa! Gracias por registrarte.', { id: toastId });
      
      setTimeout(() => {
        router.push('/');
      }, 2000); 

    } catch (error: any) {
      toast.error(error.message || 'Error de conexión. Intenta de nuevo.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... (El JSX del 'return' no cambia en absoluto)
    <main className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12">
           <Link href="/" className="text-blue-600 hover:underline mb-4 block">
              &larr; Volver a todas las capacitaciones
            </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{capacitacion.nombre}</h1>
            <p className="mt-2 text-lg text-gray-600">Instructor: {capacitacion.instructor}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* --- Columna de Información --- */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Descripción del Curso</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{capacitacion.descripcion}</p>
          </div>

          {/* --- Columna del Formulario --- */}
          <div className="bg-white p-8 rounded-xl shadow-xl">
             <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Formulario de Inscripción</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="nombreUsuario" required value={formData.nombreUsuario} onChange={handleInputChange} placeholder="Nombre Completo" className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg"/>
              <input type="email" name="emailUsuario" required value={formData.emailUsuario} onChange={handleInputChange} placeholder="Correo Electrónico" className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg"/>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Teléfono (Opcional)" className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg"/>
              <select name="concesionarioId" required value={formData.concesionarioId} onChange={handleInputChange} className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg">
                <option value="" disabled>-- Selecciona tu Concesionario --</option>
                {concesionarios.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <textarea name="informacionAdicional" value={formData.informacionAdicional} onChange={handleInputChange} placeholder="Información adicional (Opcional)" rows={3} className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg"/>
              <select name="grupoId" required value={formData.grupoId} onChange={handleInputChange} className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg">
                <option value="" disabled>-- Selecciona un Grupo --</option>
                {grupos.map(g => (
                  <option key={g.id} value={g.id} disabled={g.cuposRestantes <= 0}>
                    {`Grupo del ${new Date(g.fechaInicio).toLocaleDateString('es-AR')} - Cupos restantes: ${g.cuposRestantes}`}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={loading} className="w-full py-3 px-4 text-lg font-medium text-white bg-[#D80027] hover:bg-[#b80021] rounded-lg disabled:bg-gray-400">
                {loading ? 'Inscribiendo...' : 'Confirmar Inscripción'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

// --- getServerSideProps (MODIFICADO) ---
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  context.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { id } = context.params!; 
  try {
    // 3. Usamos la variable API_BASE_URL
    const [resCap, resGru, resCon] = await Promise.all([
      fetch(`${API_BASE_URL}/capacitaciones/${id}`),
      fetch(`${API_BASE_URL}/grupos`),
      fetch(`${API_BASE_URL}/concesionarios`),
    ]);
    if (!resCap.ok) { return { props: { capacitacion: null, grupos: [], concesionarios: [] } }; }
    const [capacitacion, todosLosGrupos, concesionarios] = await Promise.all([ resCap.json(), resGru.json(), resCon.json() ]);
    const gruposDeLaCapacitacion = todosLosGrupos.filter( (g: Grupo) => g.capacitacionId === capacitacion.id );
    return { props: { capacitacion, grupos: gruposDeLaCapacitacion, concesionarios } };
  } catch (error) {
    console.error('Failed to connect to the API:', error);
    return { props: { capacitacion: null, grupos: [], concesionarios: [] } };
  }
};