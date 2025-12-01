'use client';

import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell 
} from 'recharts';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { useState, useEffect, useTransition } from 'react';
import { Users, TrendingUp, Award, CalendarDays, Filter, XCircle, Search, Loader2 } from 'lucide-react';
import { KPIStats } from '@/lib/services/reportes.service';

interface ReportsDashboardProps {
    stats: KPIStats;
    capacitaciones: any[];
    grupos: any[];
}

const COLORS = ['#CC0000', '#073949', '#E63946', '#457B9D', '#1D3557'];

export default function ReportsDashboard({ stats, capacitaciones, grupos }: ReportsDashboardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [selectedCapacitacion, setSelectedCapacitacion] = useState(searchParams.get('capacitacion') || '');
    const [selectedGrupo, setSelectedGrupo] = useState(searchParams.get('grupo') || '');

    // LOG 1: Ver qué llega desde el servidor (stats) y URL
    console.log("📊 [Dashboard Render] Stats recibidas:", stats);
    console.log("🔗 [Dashboard Render] URL Params:", searchParams.toString());

    useEffect(() => {
        const cap = searchParams.get('capacitacion') || '';
        const grp = searchParams.get('grupo') || '';
        console.log("🔄 [Effect] Sincronizando estado con URL:", { cap, grp });
        setSelectedCapacitacion(cap);
        setSelectedGrupo(grp);
    }, [searchParams]);

    const handleCapacitacionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        console.log("👉 [Change] Capacitación seleccionada:", val);
        setSelectedCapacitacion(val);
        setSelectedGrupo('');
    };

    const handleGrupoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        console.log("👉 [Change] Grupo seleccionado:", val);
        setSelectedGrupo(val);
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        
        if (selectedCapacitacion) params.set('capacitacion', selectedCapacitacion);
        if (selectedGrupo) params.set('grupo', selectedGrupo);

        const url = `/admin/reportes?${params.toString()}`;
        console.log("🚀 [Apply] Navegando a:", url);

        startTransition(() => {
            router.push(url);
            router.refresh();
            console.log("✅ [Apply] Router push & refresh ejecutados");
        });
    };

    const clearFilters = () => {
        console.log("🧹 [Clear] Limpiando filtros");
        setSelectedCapacitacion('');
        setSelectedGrupo('');
        
        startTransition(() => {
            router.push('/admin/reportes');
            router.refresh();
        });
    };

    const hasActiveFilters = searchParams.has('capacitacion') || searchParams.has('grupo');
    const isLoading = isPending;

    return (
        <div className="space-y-8 animate-fade-in">
            
            {/* Barra de Filtros */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col lg:flex-row items-end lg:items-center gap-4">
                
                <div className="flex items-center text-gray-500 font-medium text-sm mr-2 self-center lg:self-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros:
                </div>

                {/* Select Capacitación */}
                <div className="flex-1 w-full">
                    <label className="block text-xs text-gray-500 mb-1 ml-1">Capacitación</label>
                    <select 
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-crucianelli-primary outline-none cursor-pointer"
                        value={selectedCapacitacion}
                        onChange={handleCapacitacionChange}
                        disabled={isLoading}
                    >
                        <option value="">Todas</option>
                        {capacitaciones.map((cap) => (
                            <option key={cap.id} value={cap.id}>{cap.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Select Grupo */}
                <div className="flex-1 w-full">
                    <label className="block text-xs text-gray-500 mb-1 ml-1">Grupo</label>
                    <select 
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-crucianelli-primary outline-none disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer"
                        value={selectedGrupo}
                        onChange={handleGrupoChange}
                        disabled={!selectedCapacitacion || isLoading}
                    >
                        <option value="">Todos</option>
                        {grupos.map((g) => (
                            <option key={g.id} value={g.id}>{g.nombre_grupo}</option>
                        ))}
                    </select>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-2 w-full lg:w-auto pt-6 lg:pt-0">
                    <button 
                        onClick={applyFilters}
                        disabled={isLoading}
                        className="flex-1 lg:flex-none bg-crucianelli-secondary hover:bg-crucianelli-primary text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center shadow-sm disabled:opacity-70 min-w-[100px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Cargando
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4 mr-2" />
                                Aplicar
                            </>
                        )}
                    </button>

                    {(selectedCapacitacion || hasActiveFilters) && (
                        <button 
                            onClick={clearFilters}
                            disabled={isLoading}
                            className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center px-3 py-2 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
                            title="Limpiar filtros"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 rounded-full bg-blue-50 text-blue-600 mr-4">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Inscripciones</p>
                        <h3 className="text-3xl font-extrabold text-gray-800">{stats.totalInscripciones}</h3>
                        <p className="text-xs text-gray-400 mt-1">Total filtrado</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 rounded-full bg-green-50 text-green-600 mr-4">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Asistencia</p>
                        <h3 className="text-3xl font-extrabold text-gray-800">{stats.tasaAsistenciaGlobal}%</h3>
                        <p className="text-xs text-gray-400 mt-1">Tasa efectiva</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-4 rounded-full bg-yellow-50 text-yellow-600 mr-4">
                        <Award className="w-8 h-8" />
                    </div>
                    <div className="overflow-hidden w-full">
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Líder</p>
                        <h3 className="text-xl font-extrabold text-gray-800 truncate" title={stats.concesionariosTop[0]?.name || ''}>
                            {stats.concesionariosTop[0]?.name || '-'}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Mayor participación</p>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            {stats.totalInscripciones > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center mb-6">
                            <CalendarDays className="w-5 h-5 text-gray-500 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Evolución Temporal</h3>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.inscripcionesPorMes} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="inscritos" name="Inscritos" fill="#073949" radius={[4, 4, 0, 0]} barSize={30} />
                                    <Bar dataKey="asistentes" name="Asistieron" fill="#CC0000" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center mb-6">
                            <Award className="w-5 h-5 text-gray-500 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Participación por Concesionario</h3>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.concesionariosTop}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.concesionariosTop.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Filter className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Sin datos para mostrar</h3>
                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                        No se encontraron inscripciones con los filtros seleccionados.
                    </p>
                </div>
            )}
        </div>
    );
}