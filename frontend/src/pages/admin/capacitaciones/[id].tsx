// frontend/src/pages/admin/capacitaciones/[id].tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiDownload, FiEye, FiEdit } from 'react-icons/fi'; // <-- 1. Importamos FiEdit
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import nookies from 'nookies';

// ... (Las interfaces se mantienen igual)
interface Grupo { id: number; fechaInicio: string; fechaFin: string; cupoMaximo: number; }
interface Capacitacion { id: number; nombre: string; instructor: string; grupos: Grupo[]; }
interface Inscripcion { id: number; nombreUsuario: string; emailUsuario: string; telefono: string | null; concesionario: { nombre: string } | null; }
type PageProps = { capacitacion: Capacitacion | null; inscriptos: Inscripcion[]; error?: string; };

export default function DetalleCapacitacionPage({ capacitacion, inscriptos, error: initialError }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  
  const [error, setError] = useState(initialError || '');
  const router = useRouter();
  const { id } = router.query;

  const handleExport = async () => {
    const token = localStorage.getItem('token'); 
    if (!token) return router.push('/admin/login');
    setError('');
    try {
        const response = await fetch(`http://127.0.0.1:3001/capacitaciones/${id}/exportar/csv`, {
            headers: { Authorization: `Bearer ${token}` }
        });
         if (response.status === 401) {
             localStorage.removeItem('token');
             nookies.destroy(null, 'token', { path: '/' });
             return router.push('/admin/login');
        }
        if (!response.ok) throw new Error('Error al exportar');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inscriptos_${capacitacion?.nombre.replace(/\s+/g, '_')}_${id}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err: any) {
        setError(err.message || 'No se pudo generar el archivo CSV.');
    }
  };

  if (error) return <div className="p-4 text-red-500 bg-red-100 rounded-lg">{error}</div>;
  if (!capacitacion) return <div className="p-4">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
            <Link href="/admin/capacitaciones" className="text-sm text-blue-600 hover:underline mb-2 block">
            &larr; Volver a Gestión
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">{capacitacion.nombre}</h1>
            <p className="text-lg text-gray-600 mt-1">Instructor: {capacitacion.instructor}</p>
        </div>
        <div className="flex space-x-2">
            {/* --- 2. Botón de Editar (para la Fase 9.2) --- */}
            <Link 
              href={`/admin/capacitaciones/${id}/edit`}
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
                <FiEdit className="mr-2" />
                Editar
            </Link>
            <button 
              onClick={handleExport}
              className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
                <FiDownload className="mr-2" />
                Exportar (CSV)
            </button>
        </div>
      </div>
      
      {/* --- Sección de Grupos --- */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Grupos Programados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capacitacion.grupos.length > 0 ? capacitacion.grupos.map(grupo => (
            <div key={grupo.id} className="p-4 border rounded-lg bg-gray-50">
              <p><strong>Fecha Inicio:</strong> {new Date(grupo.fechaInicio).toLocaleString('es-AR')}</p>
              <p><strong>Fecha Fin:</strong> {new Date(grupo.fechaFin).toLocaleString('es-AR')}</p>
              <p><strong>Cupo Máximo:</strong> {grupo.cupoMaximo}</p>
            </div>
          )) : (
            <p className="text-gray-500 col-span-full">No hay grupos programados para esta capacitación.</p>
          )}
        </div>
      </div>

      {/* --- Contenedor de la Tabla de Inscriptos --- */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Inscriptos ({inscriptos.length})</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concesionario</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {inscriptos.map(inscripto => (
                        <tr key={inscripto.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inscripto.nombreUsuario}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inscripto.emailUsuario}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inscripto.telefono || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inscripto.concesionario?.nombre || 'N/A'}</td> 
                        </tr>
                    ))}
                </tbody>
            </table>
            {inscriptos.length === 0 && <p className="text-center py-4 text-gray-500">No hay inscriptos en esta capacitación.</p>}
        </div>
      </div>
    </div>
  );
}

// --- getServerSideProps ¡MODIFICADO! ---
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const cookies = nookies.get(context);
  const token = cookies.token;
  if (!token) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  const { id } = context.params!;
  try {
    const [resCap, resIns] = await Promise.all([
        // --- 3. ¡AQUÍ ESTÁ EL CAMBIO! Usamos el nuevo endpoint de admin ---
        fetch(`http://127.0.0.1:3001/capacitaciones/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://127.0.0.1:3001/capacitaciones/${id}/inscriptos`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (resCap.status === 401 || resIns.status === 401) {
        nookies.destroy(context, 'token', { path: '/' });
        return { redirect: { destination: '/admin/login', permanent: false } };
    }
    
    // --- 4. Manejamos el 404 que puede lanzar nuestro nuevo servicio ---
    if (resCap.status === 404) {
      return { notFound: true }; // Muestra una página 404
    }

    if (!resCap.ok) { return { props: { capacitacion: null, inscriptos: [], error: `Error ${resCap.status} al cargar.` } }; }
    if (!resIns.ok) { return { props: { capacitacion: await resCap.json(), inscriptos: [], error: `Error ${resIns.status} al cargar.` } }; }
    
    const dataCap = await resCap.json();
    const dataInscriptos = await resIns.json();
    
    return { props: { capacitacion: dataCap, inscriptos: dataInscriptos } };
  } catch (err: any) {
    console.error(`SSR DEBUG: Error fetching data in admin/[id].tsx for ID ${id}:`, err);
    return { props: { capacitacion: null, inscriptos: [], error: 'No se pudo conectar.' } };
  }
};