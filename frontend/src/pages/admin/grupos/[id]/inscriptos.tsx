// frontend/src/pages/admin/grupos/[id]/inscriptos.tsx

import React, { useState, useEffect, useCallback } from 'react'; 
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import { FiUsers, FiCheckCircle, FiXCircle, FiClock, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import AdminLayout from '@/components/AdminLayout'; 
import toast from 'react-hot-toast'; // Agregamos toast

// --- INTERFACES DE DATOS (Basadas en el Backend 6.1) ---

type InscripcionEstado = 'PENDIENTE' | 'ASISTIÓ' | 'AUSENTE' | 'CANCELADA';

interface Concesionario {
    nombre: string;
    email: string;
    telefono: string;
}

interface Inscripcion {
    id: number;
    nombreUsuario: string; // Faltaba en la interfaz anterior
    estado: InscripcionEstado;
    concesionario: Concesionario;
    createdAt: string; 
}

interface KPIs {
    totalInscripciones: number;
    asistencias: number;
    ausencias: number;
    pendientes: number;
    cupoMaximo: number;
}

interface GrupoDetail {
    id: number;
    capacitacionId: number;
    capacitacion: {
        id: number;
        nombre: string;
    };
    fechaInicio: string;
    fechaFin: string;
    cupoMaximo: number;
    inscripciones: Inscripcion[];
    kpis: KPIs;
}

// --- HELPERS ---

// Formatea la fecha y hora
const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    return `${date.toLocaleDateString('es-AR', dateOptions)} ${date.toLocaleTimeString('es-AR', timeOptions)}`;
};

// Devuelve el texto y el color de Tailwind para el estado
const getStatusBadge = (status: InscripcionEstado) => {
    switch (status) {
        case 'ASISTIÓ':
            return <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">Asistió</span>;
        case 'AUSENTE':
            return <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">Ausente</span>;
        case 'PENDIENTE':
            return <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">Pendiente</span>;
        case 'CANCELADA':
            return <span className="px-3 py-1 text-sm font-medium text-gray-800 bg-gray-200 rounded-full">Cancelada</span>;
        default:
            return <span className="px-3 py-1 text-sm font-medium text-gray-500 bg-gray-100 rounded-full">Desconocido</span>;
    }
};

// Tarjeta para mostrar KPIs
const KpiCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className={`p-4 bg-white rounded-xl shadow flex items-center justify-between border-l-4 ${color}`}>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-')}/10 text-xl`}>{icon}</div>
    </div>
);

const GrupoHeader: React.FC<{ grupo: GrupoDetail }> = ({ grupo }) => (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4">
            {grupo.capacitacion.nombre}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
            <div className="flex items-center space-x-2">
                <FiClock className="text-xl text-[#D80027]" />
                <div>
                    <span className="font-semibold block text-sm">Inicio:</span>
                    <span className="text-base">{formatDateTime(grupo.fechaInicio)}</span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <FiClock className="text-xl text-[#D80027]" />
                <div>
                    <span className="font-semibold block text-sm">Fin:</span>
                    <span className="text-base">{formatDateTime(grupo.fechaFin)}</span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <FiUsers className="text-xl text-[#D80027]" />
                <div>
                    <span className="font-semibold block text-sm">Cupo Máximo:</span>
                    <span className="text-base">{grupo.cupoMaximo}</span>
                </div>
            </div>
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function InscriptosPage() {
    const router = useRouter();
    const { id } = router.query;
    const groupId = id ? parseInt(id as string) : null;

    // Uso correcto del hook
    const { request, loading: apiLoading, error: hookError } = useApi(); 
    
    const [grupoData, setGrupoData] = useState<GrupoDetail | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Función para obtener los datos
    const fetchData = useCallback(async () => {
        if (!groupId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await request<GrupoDetail>(`/grupos/${groupId}/inscriptos`);
            setGrupoData(data);
        } catch (err: any) {
            setError(err);
            toast.error(err.message || "Error al cargar los datos.");
        } finally {
            setIsLoading(false);
        }
    }, [groupId, request]);
    
    // Función de refresh que el usuario puede usar
    const refresh = useCallback(() => {
        fetchData();
    }, [fetchData]);


    // useEffect para disparar la carga inicial
    useEffect(() => {
        fetchData();
    }, [fetchData]);


    // Manejo de estado de asistencia y baja (R9)
    const handleUpdateStatus = (inscripcionId: number, nuevoEstado: InscripcionEstado) => {
        // FIX: Se usa toast() en lugar de toast.info()
        toast(`Funcionalidad de asistencia (${nuevoEstado}) para inscr. ${inscripcionId} se implementará en la próxima fase.`);
    };

    const handleDarDeBaja = (inscripcionId: number) => {
        // FIX: Se usa toast() en lugar de toast.info()
        toast(`Funcionalidad de Dar de Baja para inscr. ${inscripcionId} se implementará en la próxima fase.`);
    };


    if (error || hookError) {
        return (
            <AdminLayout>
                <div className="text-center py-10">
                    <h1 className="text-2xl font-bold text-red-600">Error al Cargar</h1>
                    <p className="text-gray-600">No se pudo cargar la información del grupo. {error?.message || hookError}</p>
                    <button onClick={refresh} className="mt-4 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 flex items-center mx-auto">
                        <FiRefreshCw className="inline mr-2"/> Reintentar
                    </button>
                </div>
            </AdminLayout>
        );
    }
    
    if (isLoading || !grupoData) {
        return (
            <AdminLayout>
                <div className="text-center py-10">
                    <h1 className="text-2xl font-bold text-gray-800">Cargando Detalle del Grupo...</h1>
                    <p className="text-gray-500">Por favor, espere.</p>
                </div>
            </AdminLayout>
        );
    }

    const { kpis, inscripciones, capacitacionId } = grupoData;
    const cupo = `${kpis.totalInscripciones}/${kpis.cupoMaximo}`;
    
    return (
        <AdminLayout>
            <Head>
                <title>Inscritos Grupo {groupId} - Admin</title>
            </Head>

            <div className="max-w-7xl mx-auto py-8 space-y-6">
                
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Inscriptos del Grupo #{groupId}
                    </h1>
                    <Link href={`/admin/capacitaciones/${capacitacionId}`} className="text-blue-600 hover:underline flex items-center">
                        &larr; Volver a la Capacitación
                    </Link>
                </div>
                
                {/* 1. HEADER DE GRUPO */}
                <GrupoHeader grupo={grupoData} />

                {/* 2. KPIs / ESTADÍSTICAS (R9) */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                    <KpiCard 
                        title="Inscriptos Totales" 
                        value={kpis.totalInscripciones} 
                        icon={<FiUsers />} 
                        color="border-indigo-500 text-indigo-500"
                    />
                    <KpiCard 
                        title="Cupo" 
                        value={cupo} 
                        icon={<FiMapPin />}
                        color="border-gray-500 text-gray-500"
                    />
                    <KpiCard 
                        title="Pendientes" 
                        value={kpis.pendientes} 
                        icon={<FiClock />} 
                        color="border-yellow-500 text-yellow-500"
                    />
                    <KpiCard 
                        title="Asistencias" 
                        value={kpis.asistencias} 
                        icon={<FiCheckCircle />} 
                        color="border-green-500 text-green-500"
                    />
                     <KpiCard 
                        title="Ausencias" 
                        value={kpis.ausencias} 
                        icon={<FiXCircle />} 
                        color="border-red-500 text-red-500"
                    />
                </div>

                {/* 3. TABLA DE INSCRIPTOS */}
                <div className="bg-white p-6 rounded-xl shadow-md mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Lista de Participantes ({inscripciones.length})</h2>
                         <button onClick={refresh} className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-150 flex items-center">
                            <FiRefreshCw className="mr-2"/> Refrescar
                        </button>
                    </div>
                    
                    {inscripciones.length === 0 ? (
                        <p className="text-gray-500 italic">Este grupo aún no tiene participantes inscriptos.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nombre
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Concesionario
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Teléfono
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {inscripciones.map((inscripcion) => (
                                        <tr key={inscripcion.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {inscripcion.nombreUsuario}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {inscripcion.concesionario.nombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {inscripcion.concesionario.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {inscripcion.concesionario.telefono || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {getStatusBadge(inscripcion.estado)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {/* Botones de acción para R9 */}
                                                <button 
                                                    onClick={() => handleUpdateStatus(inscripcion.id, 'ASISTIÓ')}
                                                    title="Marcar Asistencia"
                                                    className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                                                    disabled={apiLoading}
                                                >
                                                  <FiCheckCircle />
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateStatus(inscripcion.id, 'AUSENTE')}
                                                    title="Marcar Ausencia"
                                                    className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                                                    disabled={apiLoading}
                                                >
                                                  <FiXCircle />
                                                </button>
                                                <button 
                                                    onClick={() => handleDarDeBaja(inscripcion.id)}
                                                    title="Dar de Baja"
                                                    className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                    disabled={apiLoading}
                                                >
                                                  <FiUsers />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}