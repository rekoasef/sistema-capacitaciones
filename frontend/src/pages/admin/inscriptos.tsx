// frontend/src/pages/admin/inscriptos.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiDownload } from 'react-icons/fi'; // Importamos el icono

// ... (Las interfaces se mantienen igual)
interface Inscripcion { id: number; nombreUsuario: string; emailUsuario: string; grupoId: number; telefono: string | null; concesionario: { nombre: string } | null; grupo: { capacitacion: { nombre: string }, fechaInicio: string } }
interface Grupo { id: number; fechaInicio: string; capacitacionId: number; }
interface Capacitacion { id: number; nombre: string; }

export default function GestionInscriptosPage() {
  // --- Estados y lógica de fetch se mantienen igual ---
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/admin/login');
      
      try {
        setLoading(true);
        const [resCap, resGru, resIns] = await Promise.all([
          fetch('http://127.0.0.1:3001/capacitaciones', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://127.0.0.1:3001/grupos', { headers: { Authorization: `Bearer ${token}` } }),
          // ¡ERROR CORREGIDO! El endpoint de inscriptos también debe estar protegido
          fetch('http://127.0.0.1:3001/inscripciones', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (resCap.status === 401 || resGru.status === 401 || resIns.status === 401) {
          localStorage.removeItem('token');
          return router.push('/admin/login');
        }
        
        // Verificamos todas las respuestas
        if (!resCap.ok || !resGru.ok || !resIns.ok) {
            throw new Error('No se pudieron cargar todos los datos.');
        }

        const dataCap = await resCap.json();
        const dataGru = await resGru.json();
        const dataIns = await resIns.json();
        
        setCapacitaciones(dataCap);
        setGrupos(dataGru);
        setInscripciones(dataIns);
      } catch (err: any) {
        setError(err.message || 'No se pudieron cargar los datos de los inscriptos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleExport = async () => {
    // ... (handleExport se mantiene igual)
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://127.0.0.1:3001/inscripciones/exportar/csv', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al exportar');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inscripciones.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (err: any) {
        setError(err.message || 'No se pudo generar el archivo CSV.');
    }
  };

  if (loading) return <div>Cargando inscriptos...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // --- JSX RENDER (CON TABLA MEJORADA) ---
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Visualización de Inscriptos</h1>
        <button 
          onClick={handleExport}
          className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
        >
            <FiDownload className="mr-2" />
            Exportar Todo a CSV
        </button>
      </div>

      {/* --- Contenedor de la Tabla Refinada --- */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Total de Inscriptos ({inscripciones.length})</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email / Teléfono</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concesionario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacitación</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {inscripciones.map(inscripto => {
                      // Buscamos los datos relacionados para mostrar
                      const grupo = grupos.find(g => g.id === inscripto.grupoId);
                      const capacitacion = capacitaciones.find(c => c.id === grupo?.capacitacionId);
                      
                      return (
                        <tr key={inscripto.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inscripto.nombreUsuario}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>{inscripto.emailUsuario}</div>
                                <div className="text-xs text-gray-400">{inscripto.telefono || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inscripto.concesionario?.nombre || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{capacitacion?.nombre || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grupo ? new Date(grupo.fechaInicio).toLocaleDateString('es-AR') : 'N/A'}</td>
                        </tr>
                      );
                    })}
                </tbody>
            </table>
            {inscripciones.length === 0 && <p className="text-center py-4 text-gray-500">No hay inscriptos en ninguna capacitación.</p>}
        </div>
      </div>
    </div>
  );
}