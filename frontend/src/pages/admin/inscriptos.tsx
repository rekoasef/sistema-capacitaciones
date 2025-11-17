// frontend/src/pages/admin/inscriptos.tsx

import { useEffect, useState, useCallback } from 'react'; // 1. Importar useCallback
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiDownload, FiCheckSquare, FiUserMinus, FiTrash2, FiXSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import { useApi } from '@/hooks/useApi'; // 2. Importar el hook

// --- ¡AQUÍ ESTÁ EL CAMBIO! ---
// 3. Definimos la URL base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- Interfaces (actualizadas para incluir todo lo que necesitamos) ---
interface Inscripcion { 
  id: number; 
  nombreUsuario: string; 
  emailUsuario: string; 
  grupoId: number; 
  telefono: string | null; 
  estado: string;
  concesionario: { nombre: string } | null; 
  // Añadimos grupo y capacitación anidados para simplificar el renderizado
  grupo: { 
    fechaInicio: string;
    capacitacion: { 
      nombre: string 
    } 
  } 
}
// Nota: El endpoint GET /inscripciones no devuelve el grupo anidado.
// Lo mantendremos como estaba y haremos el fetching de grupos y capacitaciones por separado.
interface SimpleInscripcion {
  id: number; 
  nombreUsuario: string; 
  emailUsuario: string; 
  grupoId: number; 
  telefono: string | null; 
  estado: string;
  concesionario: { nombre: string } | null; 
}
interface Grupo { id: number; fechaInicio: string; capacitacionId: number; }
interface Capacitacion { id: number; nombre: string; }

export default function GestionInscriptosPage() {
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [inscripciones, setInscripciones] = useState<SimpleInscripcion[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  // 4. Usar el hook useApi
  const { request, loading: apiLoading } = useApi();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inscripcionParaEliminar, setInscripcionParaEliminar] = useState<number | null>(null);

  // 5. Refactorizar fetchData
  const fetchData = useCallback(async () => {
    setError('');
    try {
      // Cargamos todos los recursos en paralelo
      const [dataCap, dataGru, dataIns] = await Promise.all([
        request<Capacitacion[]>('/capacitaciones/admin/all', { method: 'GET' }),
        request<Grupo[]>('/grupos', { method: 'GET' }),
        request<SimpleInscripcion[]>('/inscripciones', { method: 'GET' }),
      ]);
      
      if (dataCap) setCapacitaciones(dataCap);
      if (dataGru) setGrupos(dataGru);
      if (dataIns) setInscripciones(dataIns);

    } catch (err: any) {
      // El hook ya maneja el 401, solo mostramos el error
      setError(err.message || 'No se pudieron cargar los datos de los inscriptos.');
      toast.error(err.message || 'No se pudieron cargar los datos.');
    }
  }, [request]); // Depender de 'request' del hook

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 6. handleExport (MODIFICADO con API_BASE_URL)
  // (Usamos fetch simple porque esperamos un 'blob', no JSON)
  const handleExport = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/inscripciones/exportar/csv`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 401) {
          localStorage.removeItem('token');
          return router.push('/admin/login');
        }
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
        toast.error(err.message || 'No se pudo generar el archivo CSV.');
    }
  };

  // 7. handleChangeEstado (REFACTORIZADO CON HOOK)
  const handleChangeEstado = async (inscripcionId: number, nuevoEstado: 'ASISTIÓ' | 'AUSENTE' | 'PENDIENTE') => {
    const toastId = toast.loading(`Cambiando estado a ${nuevoEstado}...`);
    try {
      await request(`/inscripciones/${inscripcionId}`, {
        method: 'PATCH',
        body: { estado: nuevoEstado },
      });
      toast.success('Estado actualizado', { id: toastId });
      
      setInscripciones(prevInscripciones => 
        prevInscripciones.map(insc => 
          insc.id === inscripcionId ? { ...insc, estado: nuevoEstado } : insc
        )
      );
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };
  
  const openDeleteModal = (id: number) => {
    setInscripcionParaEliminar(id);
    setIsModalOpen(true);
  };

  // 8. handleDeleteInscripcion (REFACTORIZADO CON HOOK)
  const handleDeleteInscripcion = async () => {
    if (!inscripcionParaEliminar) return;
    const toastId = toast.loading('Dando de baja al inscripto...');
    try {
      await request(`/inscripciones/${inscripcionParaEliminar}`, {
        method: 'DELETE',
      });
      toast.success('Inscripción eliminada', { id: toastId });
      
      setInscripciones(prevInscripciones => 
        prevInscripciones.filter(insc => insc.id !== inscripcionParaEliminar)
      );
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsModalOpen(false);
      setInscripcionParaEliminar(null);
    }
  };

  // 9. Deshabilitar botones si el hook está 'loading'
  if (apiLoading && inscripciones.length === 0) return <div>Cargando inscriptos...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Visualización de Inscriptos</h1>
        <button 
          onClick={handleExport}
          className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
          disabled={apiLoading}
        >
            <FiDownload className="mr-2" />
            Exportar Todo a CSV
        </button>
      </div>

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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {inscripciones.map(inscripto => {
                      const grupo = grupos.find(g => g.id === inscripto.grupoId);
                      const capacitacion = capacitaciones.find(c => c.id === grupo?.capacitacionId);
                      
                      const estadoStyles = {
                        'PENDIENTE': 'bg-yellow-100 text-yellow-800',
                        'ASISTIÓ': 'bg-green-100 text-green-800',
                        'AUSENTE': 'bg-red-100 text-red-800',
                      };
                      const estadoStyle = estadoStyles[inscripto.estado as keyof typeof estadoStyles] || estadoStyles['PENDIENTE'];
                      
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoStyle}`}>
                                {inscripto.estado}
                              </span>
                            </td>
                            {/* 9. Deshabilitar botones si el hook está 'loading' */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              {inscripto.estado !== 'ASISTIÓ' && (
                                <button 
                                  onClick={() => handleChangeEstado(inscripto.id, 'ASISTIÓ')}
                                  title="Marcar Asistencia"
                                  className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                                  disabled={apiLoading}
                                >
                                  <FiCheckSquare />
                                </button>
                              )}
                              {inscripto.estado !== 'AUSENTE' && (
                                <button 
                                  onClick={() => handleChangeEstado(inscripto.id, 'AUSENTE')}
                                  title="Marcar Ausencia"
                                  className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                                  disabled={apiLoading}
                                >
                                  <FiXSquare />
                                </button>
                              )}
                              {inscripto.estado !== 'PENDIENTE' && (
                                <button 
                                  onClick={() => handleChangeEstado(inscripto.id, 'PENDIENTE')}
                                  title="Marcar como Pendiente"
                                  className="p-2 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                  disabled={apiLoading}
                                >
                                  <FiUserMinus />
                                </button>
                              )}
                              <button 
                                onClick={() => openDeleteModal(inscripto.id)}
                                title="Dar de Baja (Eliminar)"
                                className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                                disabled={apiLoading}
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                        </tr>
                      );
                    })}
                </tbody>
            </table>
            {inscripciones.length === 0 && !apiLoading && <p className="text-center py-4 text-gray-500">No hay inscriptos en ninguna capacitación.</p>}
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteInscripcion}
        title="¿Dar de baja al Inscripto?"
        message="¿Estás seguro de que quieres eliminar esta inscripción? Esta acción no se puede deshacer."
        confirmText="Sí, Dar de Baja"
      />
    </div>
  );
}