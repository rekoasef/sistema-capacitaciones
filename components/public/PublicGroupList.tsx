'use client';

import Link from 'next/link';
import { Calendar, Clock, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GrupoWithDias } from '@/types/grupo.types';

interface PublicGroupListProps {
    grupos: GrupoWithDias[];
}

export default function PublicGroupList({ grupos }: PublicGroupListProps) {

    // Helper para formatear fechas de forma amigable (Ej: "Lun 10/11")
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        // Ajuste de zona horaria para evitar desfases (UTC a Local)
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

        return new Intl.DateTimeFormat('es-AR', {
            weekday: 'short',
            day: 'numeric',
            month: 'numeric',
        }).format(adjustedDate);
    };

    if (grupos.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No hay fechas disponibles por el momento.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {grupos.map((grupo) => {
                const isAvailable = grupo.estado === 'activo';
                const isFull = grupo.estado === 'lleno';

                return (
                    <div 
                        key={grupo.id} 
                        className={`border rounded-lg p-4 transition-all ${
                            isAvailable 
                                ? 'bg-white border-gray-200 hover:border-crucianelli-primary hover:shadow-md' 
                                : 'bg-gray-50 border-gray-200 opacity-70'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">
                                    {grupo.nombre_grupo}
                                </h4>
                                {isFull && (
                                    <span className="inline-flex items-center text-xs font-semibold text-red-600 mt-1">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Cupo Completo
                                    </span>
                                )}
                            </div>
                            
                            {/* Botón de Acción */}
                            {isAvailable ? (
                                <Link
                                    // En la próxima fase crearemos esta ruta
                                    href={`/inscripcion?grupo=${grupo.id}`} 
                                    className="px-3 py-1.5 bg-crucianelli-secondary text-white text-xs font-bold rounded hover:bg-crucianelli-primary transition-colors"
                                >
                                    Inscribirme
                                </Link>
                            ) : (
                                <button disabled className="px-3 py-1.5 bg-gray-200 text-gray-500 text-xs font-bold rounded cursor-not-allowed">
                                    No disponible
                                </button>
                            )}
                        </div>

                        {/* Lista de Días */}
                        <div className="space-y-2">
                            {grupo.dias.map((dia) => (
                                <div key={dia.id} className="flex items-center text-sm text-gray-600">
                                    <div className="flex items-center w-24">
                                        <Calendar className="w-3 h-3 mr-1.5 text-crucianelli-primary" />
                                        <span className="capitalize">{formatDate(dia.fecha)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                                        <span>{dia.hora_inicio?.slice(0, 5)} - {dia.hora_fin?.slice(0, 5)} hs</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer del Card */}
                        {isAvailable && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-xs text-green-700 font-medium">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Inscripción abierta
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}