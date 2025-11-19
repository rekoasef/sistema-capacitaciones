// frontend/src/pages/admin/dashboard.tsx

import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import nookies from 'nookies';
import { FiUsers, FiFileText, FiCheckSquare } from 'react-icons/fi';
import Link from 'next/link';

// 1. Definimos la URL base de la API usando la variable de entorno.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

interface DashboardStats {
  totalInscriptos: number;
  totalCapacitaciones: number;
  totalAsistencias: number;
}

type PageProps = {
  stats: DashboardStats | null;
  error?: string;
};

export default function Dashboard({ stats, error }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (error) {
    return <div className="p-4 text-red-500 bg-red-100 rounded-lg">{error}</div>;
  }

  if (!stats) {
    return <div>Cargando estadísticas...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-10">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Inscriptos */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-4">
          <div className="bg-red-100 p-4 rounded-full">
            <FiUsers className="h-8 w-8 text-[#D80027]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Total Inscriptos</h2>
            <p className="text-5xl font-bold text-gray-800 mt-1">{stats.totalInscriptos}</p>
          </div>
        </div>
        
        {/* Total Capacitaciones */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <FiFileText className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Capacitaciones Activas</h2>
            <p className="text-5xl font-bold text-gray-800 mt-1">{stats.totalCapacitaciones}</p>
          </div>
        </div>

        {/* Total Asistencias */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-4">
          <div className="bg-green-100 p-4 rounded-full">
            <FiCheckSquare className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Total Asistencias</h2>
            <p className="text-5xl font-bold text-gray-800 mt-1">{stats.totalAsistencias}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h3>
          <div className="flex flex-col space-y-3">
            <Link href="/admin/capacitaciones/nueva" className="bg-[#D80027] text-white font-semibold py-3 px-5 rounded-lg hover:bg-[#b80021] text-center">
              Crear Nueva Capacitación
            </Link>
            <Link href="/admin/concesionarios" className="bg-gray-200 text-gray-800 font-semibold py-3 px-5 rounded-lg hover:bg-gray-300 text-center">
              Gestionar Concesionarios
            </Link>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Ver Listados</h3>
           <div className="flex flex-col space-y-3">
            <Link href="/admin/capacitaciones" className="text-blue-600 hover:underline">
              Ver todas las capacitaciones
            </Link>
            <Link href="/admin/inscriptos" className="text-blue-600 hover:underline">
              Ver todos los inscriptos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- getServerSideProps (MODIFICADO Y CORREGIDO) ---
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const cookies = nookies.get(context);
  const token = cookies.token;
  if (!token) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }

  try {
    // 2. Usamos la variable API_BASE_URL
    // CORRECCIÓN FINAL: Añadimos el prefijo /api
    const res = await fetch(`${API_BASE_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (res.status === 401) {
      nookies.destroy(context, 'token', { path: '/' });
      return { redirect: { destination: '/admin/login', permanent: false } };
    }
    if (!res.ok) {
      // Registrar el error para debug en el backend
      console.error(`Error fetching dashboard: Status ${res.status}`); 
      throw new Error(`Error ${res.status} al cargar estadísticas.`);
    }
    
    const stats = await res.json();
    return { props: { stats } };
  } catch (err: any) {
    console.error('Error fetching dashboard stats:', err);
    return { props: { stats: null, error: 'No se pudo conectar al servidor.' } };
  }
};