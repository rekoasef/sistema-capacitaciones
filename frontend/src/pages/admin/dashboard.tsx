// frontend/src/pages/admin/dashboard.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
// Importamos los iconos que usaremos
import { FiUsers, FiGrid, FiFileText } from 'react-icons/fi';

// Definimos la "forma" de los datos que esperamos
interface Stats {
  totalInscriptos: number;
  totalCapacitaciones: number;
  rankingCapacitaciones: {
    nombre: string;
    inscriptos: number;
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Añadimos estado de carga
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true); // Ponemos loading al empezar
        const response = await fetch('http://127.0.0.1:3001/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/admin/login');
          return;
        }
        if (!response.ok) throw new Error('No se pudieron cargar las estadísticas.');
        
        const data: Stats = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false); // Quitamos loading al terminar (con éxito o error)
      }
    };

    fetchStats();
  }, [router]);

  // Mejoramos la vista de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D80027]"></div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 p-4 bg-red-100 rounded-lg">{error}</div>;
  if (!stats) return null; // Si no hay stats (y no hay error ni carga), no mostramos nada

  // --- El JSX (HTML) de nuestro dashboard rediseñado ---
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* --- Sección de Tarjetas de Estadísticas (Mejoradas) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Tarjeta 1: Total Inscriptos */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-4">
          <div className="bg-red-100 p-4 rounded-full">
            <FiUsers className="h-8 w-8 text-[#D80027]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Total de Inscriptos</h2>
            <p className="text-5xl font-bold text-gray-800 mt-1">{stats.totalInscriptos}</p>
          </div>
        </div>
        
        {/* Tarjeta 2: Capacitaciones Activas */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <FiGrid className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Capacitaciones Activas</h2>
            <p className="text-5xl font-bold text-gray-800 mt-1">{stats.totalCapacitaciones}</p>
          </div>
        </div>
      </div>

      {/* --- Sección de Acciones (Rediseñada) --- */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta de Acción 1: Gestionar Capacitaciones */}
          <Link href="/admin/capacitaciones" className="block bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-[#D80027] transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-4">
                <FiFileText className="h-10 w-10 text-[#D80027]" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Gestionar Capacitaciones</h3>
                  <p className="text-gray-600 mt-1">Crear, editar y eliminar cursos y grupos.</p>
                </div>
              </div>
          </Link>

          {/* Tarjeta de Acción 2: Ver Inscriptos */}
          <Link href="/admin/inscriptos" className="block bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-4">
                <FiUsers className="h-10 w-10 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ver Inscriptos</h3>
                  <p className="text-gray-600 mt-1">Revisar listas de participantes y exportar a CSV.</p>
                </div>
              </div>
          </Link>
        </div>
      </div>

      {/* --- Sección de Ranking (Se mantiene igual) --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ranking de Capacitaciones</h2>
        <ul className="space-y-4">
          {stats.rankingCapacitaciones.length > 0 ? (
            stats.rankingCapacitaciones.map((item: any, index: number) => (
              <li key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{index + 1}. {item.nombre}</span>
                <span className="font-bold text-lg text-[#D80027]">{item.inscriptos} inscriptos</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No hay datos para generar un ranking.</p>
          )}
        </ul>
      </div>
    </div>
  );
}