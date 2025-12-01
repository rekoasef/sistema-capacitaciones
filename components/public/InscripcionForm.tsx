'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Loader2, Send, CheckCircle2, AlertTriangle, User, Mail, Phone, Building2 } from 'lucide-react';
import Link from 'next/link';

import { createInscripcionAction } from '@/lib/actions/inscripcion.actions';
import { InscripcionFormSchema, InscripcionFormInputs } from '@/types/inscripcion.types';

// Definimos una interfaz mínima para los concesionarios
interface ConcesionarioSimple {
    id: number;
    nombre: string;
}

interface InscripcionFormProps {
    grupoId: number;
    concesionarios: ConcesionarioSimple[];
}

export default function InscripcionForm({ grupoId, concesionarios }: InscripcionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<InscripcionFormInputs>({
        // @ts-ignore: Ignoramos conflicto de tipos estricto entre Zod y RHF
        resolver: zodResolver(InscripcionFormSchema),
        defaultValues: {
            grupo_id: grupoId,
            concesionario_id: 0, // Valor 0 obliga al usuario a elegir una opción válida
            nombre_inscripto: '',
            email_inscripto: '',
            telefono: ''
        }
    });

    const onSubmit: SubmitHandler<InscripcionFormInputs> = async (data) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const result = await createInscripcionAction(data);

            if (result.success) {
                setIsSuccess(true);
            } else {
                setSubmitError(result.message || "Error al procesar la inscripción.");
            }
        } catch (error) {
            setSubmitError("Ocurrió un error inesperado. Intente nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Pantalla de Éxito
    if (isSuccess) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">¡Inscripción Exitosa!</h3>
                <p className="text-green-700 mb-8 max-w-md mx-auto">
                    Tus datos han sido registrados correctamente. Tu cupo ya está reservado.
                </p>
                <Link 
                    href="/"
                    className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                    Volver al Inicio
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-crucianelli-secondary mb-6 text-center">
                Formulario de Inscripción
            </h2>

            {/* Input Oculto: ID del Grupo */}
            <input type="hidden" {...register('grupo_id')} />

            <div className="space-y-5">
                
                {/* Nombre Completo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre Completo</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            {...register('nombre_inscripto')}
                            className={`pl-10 block w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-crucianelli-primary focus:border-transparent transition-all ${
                                errors.nombre_inscripto ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>
                    {errors.nombre_inscripto && <p className="mt-1 text-sm text-red-500">{errors.nombre_inscripto.message}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo Electrónico</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            {...register('email_inscripto')}
                            className={`pl-10 block w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-crucianelli-primary focus:border-transparent transition-all ${
                                errors.email_inscripto ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="juan.perez@email.com"
                        />
                    </div>
                    {errors.email_inscripto && <p className="mt-1 text-sm text-red-500">{errors.email_inscripto.message}</p>}
                </div>

                {/* Teléfono */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono / WhatsApp</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="tel"
                            {...register('telefono')}
                            className={`pl-10 block w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-crucianelli-primary focus:border-transparent transition-all ${
                                errors.telefono ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="+54 9 341 1234567"
                        />
                    </div>
                    {errors.telefono && <p className="mt-1 text-sm text-red-500">{errors.telefono.message}</p>}
                </div>

                {/* Concesionario */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Concesionario</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            {...register('concesionario_id')}
                            className={`pl-10 block w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-crucianelli-primary focus:border-transparent transition-all appearance-none bg-white ${
                                errors.concesionario_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        >
                            <option value="0">Selecciona tu concesionario...</option>
                            {concesionarios.map((conc) => (
                                <option key={conc.id} value={conc.id}>
                                    {conc.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.concesionario_id && <p className="mt-1 text-sm text-red-500">{errors.concesionario_id.message}</p>}
                </div>

            </div>

            {/* Mensaje de Error General */}
            {submitError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700 text-sm">
                    <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                </div>
            )}

            {/* Botón Submit */}
            <div className="mt-8">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-base font-bold text-white transition-all transform hover:-translate-y-0.5 ${
                        isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-crucianelli-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crucianelli-primary'
                    }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5 mr-2" />
                            Confirmar Inscripción
                        </>
                    )}
                </button>
                <p className="text-xs text-center text-gray-400 mt-4">
                    Al inscribirte aceptas recibir comunicaciones sobre este curso.
                </p>
            </div>
        </form>
    );
}