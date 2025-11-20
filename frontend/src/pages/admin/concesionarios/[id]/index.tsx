// frontend/src/pages/admin/concesionarios/[id]/index.tsx

import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Link from 'next/link';
import nookies from 'nookies';
import { FiUsers, FiFileText, FiCheckSquare } from 'react-icons/fi';

// --- ¡AQUÍ ESTÁ EL CAMBIO! ---
// 1. Definimos la URL base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- Definición de Tipos (se mantiene igual) ---
interface InscripcionReporte {
  id: number;
  nombreUsuario: string;
  estado: string;
  grupo: {
    fechaInicio: string;
    capacitacion: {
      nombre: string;
    };
  };
}
interface ConcesionarioReporte {
  id: number;
  nombre: string;
  inscripciones: InscripcionReporte[];
}
type PageProps = {
  concesionario: ConcesionarioReporte | null;
  error?: string;
};

// --- Página de Reporte (sin cambios en el componente) ---
export default function ReporteConcesionarioPage({ concesionario, error }: InferGetServerSidePropsType<typeof getServerSideProps>) {

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-lg">
        <p>Error: {error}</p>
        <Link href="/admin/concesionarios" className="text-blue-600 hover:underline mt-4 block">
          &larr; Volver al listado
        </Link>
      </div>
    );
  }
  if (!concesionario) {
    return <div>Cargando reporte...</div>;
  }

  // --- Cálculo de KPIs (sin cambios) ---
  const { inscripciones } = concesionario;
  const totalInscriptos = inscripciones.length;
  const totalAsistencias = inscripciones.filter(i => i.estado === 'ASISTIÓ').length;
  const capacitacionesUnicas = new Set(
    inscripciones.map(i => i.grupo.capacitacion.nombre)
  ).size;

  return (
    // --- JSX (sin cambios) ---
    <div>
      <header className="mb-8">
        <Link href="/admin/concesionarios" className="text-sm text-blue-600 hover:underline mb-2 block">
          &larr; Volver a todos los concesionarios
        </Link>
        <h1 className="text-4xl font-bold text-gray-800">
          Reporte: {concesionario.nombre}
        </h1>
      </header>

      {/* --- Tarjetas de KPIs --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-4">
          <div className="bg-red-100 p-4 rounded-full">
            <FiUsers className="h-8 w-8 text-[#D80027]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Total Inscriptos</h2>
            <p className="text-5xl font-bold text-gray-800 mt-1">{totalInscriptos}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <FiFileText className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Capacitaciones Únicas</h2>
            <p className="text-5xl font-bold text-gray-800 mt-1">{capacitacionesUnicas}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-4">
          <div className="bg-green-100 p-4 rounded-full">
            <FiCheckSquare className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Total Asistencias</h2>
            <p className="text-5xl font-bold text-gray-800 mt-1">{totalAsistencias}</p>
          </div>
        </div>
      </div>

      {/* --- Tabla de Detalle --- */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalle de Inscripciones</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico Inscripto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacitación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Grupo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inscripciones.length > 0 ? inscripciones.map(insc => {
                const esPendiente = insc.estado === 'PENDIENTE';
                return (
                  <tr key={insc.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{insc.nombreUsuario}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insc.grupo.capacitacion.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(insc.grupo.fechaInicio).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        esPendiente ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {insc.estado}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">No hay inscripciones para este concesionario.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
    // 2. Usamos la variable API_BASE_URL
    const res = await fetch(`${API_BASE_URL}/api/concesionarios/reporte/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      nookies.destroy(context, 'token', { path: '/' });
      return { redirect: { destination: '/admin/login', permanent: false } };
    }
    if (res.status === 404) {
      return { notFound: true };
    }
    if (!res.ok) {
      throw new Error(`Error ${res.status} al cargar el reporte.`);
    }
    const dataReporte = await res.json();
    return { props: { concesionario: dataReporte } };
  } catch (err: any) {
    console.error(`SSR DEBUG: Error fetching data in admin/concesionarios/[id] for ID ${id}:`, err);
    return { 
      props: { 
        concesionario: null, 
        error: 'No se pudo conectar al servidor para cargar el reporte.' 
      } 
    };
  }
};