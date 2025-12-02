'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Loader2, Send, CheckCircle2, User, Mail, Phone, Building2, UserPlus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
// Importamos toast de sonner
import { toast } from 'sonner';

import { createInscripcionAction } from '@/lib/actions/inscripcion.actions';
import { getMecanicosAction } from '@/lib/actions/mecanico.actions'; 
import { InscripcionFormSchema, InscripcionFormInputs } from '@/types/inscripcion.types';
import Modal from '@/components/ui/Modal'; 

interface ConcesionarioSimple { id: number; nombre: string; }
interface MecanicoSimple { id: number; nombre: string; apellido: string; }

interface InscripcionFormProps {
    grupoId: number;
    concesionarios: ConcesionarioSimple[];
}

export default function InscripcionForm({ grupoId, concesionarios }: InscripcionFormProps) {
    const [isSuccess, setIsSuccess] = useState(false);
    // Eliminamos submitError
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [mecanicos, setMecanicos] = useState<MecanicoSimple[]>([]);
    const [isLoadingMecanicos, setIsLoadingMecanicos] = useState(false);
    const [isNewMechanicMode, setIsNewMechanicMode] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingData, setPendingData] = useState<InscripcionFormInputs | null>(null);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<InscripcionFormInputs>({
        // @ts-ignore
        resolver: zodResolver(InscripcionFormSchema),
        defaultValues: {
            grupo_id: grupoId,
            concesionario_id: 0,
            es_nuevo_mecanico: "false",
            mecanico_id: "0",
            nuevo_nombre: "",
            nuevo_apellido: "",
            email_inscripto: "",
            telefono: ""
        }
    });

    const selectedConcesionario = watch('concesionario_id');

    useEffect(() => {
        if (selectedConcesionario && Number(selectedConcesionario) > 0) {
            setIsLoadingMecanicos(true);
            setMecanicos([]);
            setValue('mecanico_id', "0"); 
            setIsNewMechanicMode(false);
            setValue('es_nuevo_mecanico', "false");

            getMecanicosAction(Number(selectedConcesionario))
                .then((result: any) => {
                    if (result.success && result.data) {
                        setMecanicos(result.data as MecanicoSimple[]);
                    } else {
                        toast.error("No se pudieron cargar los mecánicos.");
                    }
                })
                .catch(() => toast.error("Error de conexión al buscar mecánicos."))
                .finally(() => setIsLoadingMecanicos(false));
        } else {
            setMecanicos([]);
        }
    }, [selectedConcesionario, setValue]);

    const handleMecanicoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === "new_entry") {
            setIsNewMechanicMode(true);
            setValue('es_nuevo_mecanico', "true");
            setValue('mecanico_id', ""); 
        } else {
            setIsNewMechanicMode(false);
            setValue('es_nuevo_mecanico', "false");
            setValue('mecanico_id', val);
        }
    };

    const onPreSubmit: SubmitHandler<InscripcionFormInputs> = (data) => {
        if (data.es_nuevo_mecanico === "true") {
            setPendingData(data);
            setShowConfirmModal(true);
        } else {
            executeSubmission(data);
        }
    };

    const executeSubmission = async (data: InscripcionFormInputs) => {
        setIsSubmitting(true);
        // Toast de carga
        const toastId = toast.loading('Procesando tu inscripción...');

        try {
            const result = await createInscripcionAction(data);
            
            if (result.success) {
                toast.dismiss(toastId);
                toast.success('¡Inscripción confirmada!', {
                    description: 'Revisa tu correo electrónico.'
                });
                setIsSuccess(true);
                setShowConfirmModal(false);
            } else {
                toast.dismiss(toastId);
                toast.error(result.message || "No se pudo completar la inscripción.");
                setShowConfirmModal(false); 
            }
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Error de conexión. Intente nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">¡Inscripción Exitosa!</h3>
                <p className="text-green-700 mb-8 max-w-md mx-auto">
                    Tus datos han sido registrados correctamente y el cupo está reservado.
                </p>
                <Link href="/" className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                    Volver al Inicio
                </Link>
            </div>
        );
    }

    return (
        <>
        {/*@ts-ignore */}
            <form onSubmit={handleSubmit(onPreSubmit)} className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 relative">
                <h2 className="text-2xl font-bold text-crucianelli-secondary mb-6 text-center">
                    Inscripción a Capacitación
                </h2>

                <input type="hidden" {...register('grupo_id')} />
                <input type="hidden" {...register('es_nuevo_mecanico')} />

                <div className="space-y-5">
                    
                    {/* 1. Concesionario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Concesionario</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Building2 className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                {...register('concesionario_id')}
                                className="pl-10 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-crucianelli-primary bg-white focus:outline-none"
                            >
                                <option value="0">Selecciona tu concesionario...</option>
                                {concesionarios.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        {errors.concesionario_id && <p className="text-red-500 text-xs mt-1">{errors.concesionario_id.message}</p>}
                    </div>

                    {/* 2. Selección de Mecánico */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Asistente</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                disabled={!selectedConcesionario || Number(selectedConcesionario) === 0 || isLoadingMecanicos}
                                onChange={handleMecanicoChange}
                                className={`pl-10 block w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-crucianelli-primary bg-white appearance-none focus:outline-none ${
                                    isNewMechanicMode ? 'border-crucianelli-secondary ring-1 ring-crucianelli-secondary bg-blue-50/30' : 'border-gray-300'
                                }`}
                                defaultValue="0"
                            >
                                <option value="0">
                                    {isLoadingMecanicos ? "Cargando..." : "Selecciona una persona..."}
                                </option>
                                {mecanicos.map(m => (
                                    <option key={m.id} value={m.id}>{m.apellido}, {m.nombre}</option>
                                ))}
                                <option disabled>──────────</option>
                                <option value="new_entry" className="font-bold text-blue-800 bg-blue-100">
                                    + Agregar Nuevo Mecánico
                                </option>
                            </select>
                        </div>
                        {errors.mecanico_id && !isNewMechanicMode && <p className="text-red-500 text-xs mt-1">{errors.mecanico_id.message}</p>}
                    </div>

                    {/* 3. Campos para Nuevo Mecánico */}
                    {isNewMechanicMode && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fade-in space-y-4">
                            <div className="flex items-center gap-2 text-blue-800 text-sm font-semibold mb-2 border-b border-blue-200 pb-2">
                                <UserPlus className="w-4 h-4" />
                                <span>Alta de Nuevo Personal</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-blue-700 font-medium ml-1">Nombre</label>
                                    <input {...register('nuevo_nombre')} placeholder="Ej: Juan" className="w-full rounded border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                    {errors.nuevo_nombre && <p className="text-red-500 text-xs mt-1">{errors.nuevo_nombre.message}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-blue-700 font-medium ml-1">Apellido</label>
                                    <input {...register('nuevo_apellido')} placeholder="Ej: Pérez" className="w-full rounded border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                                    {errors.nuevo_apellido && <p className="text-red-500 text-xs mt-1">{errors.nuevo_apellido.message}</p>}
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-3 h-3 text-blue-500 mt-0.5" />
                                <p className="text-[11px] text-blue-600 leading-tight">
                                    Este mecánico se guardará automáticamente en la base de datos con nivel <strong>Junior</strong>.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 4. Datos de Contacto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input type="email" {...register('email_inscripto')} className="pl-9 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-crucianelli-primary outline-none" placeholder="correo@ejemplo.com" />
                            </div>
                            {errors.email_inscripto && <p className="text-red-500 text-xs mt-1">{errors.email_inscripto.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input type="tel" {...register('telefono')} className="pl-9 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-crucianelli-primary outline-none" placeholder="341..." />
                            </div>
                            {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Eliminamos submitError block */}

                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center py-3 px-4 bg-crucianelli-primary text-white font-bold rounded-lg hover:bg-red-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5 mr-2" />}
                        {isNewMechanicMode ? 'Registrar e Inscribir' : 'Confirmar Inscripción'}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">
                        Al inscribirte aceptas recibir comunicaciones sobre este curso.
                    </p>
                </div>
            </form>

            {/* Modal de Confirmación */}
            <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirmar Nuevo Mecánico">
                <div className="space-y-6">
                    <div className="flex items-start gap-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm">
                        <div className="bg-yellow-100 p-2 rounded-full">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-yellow-900 text-base">¿Estás seguro?</h4>
                            <p className="text-sm text-yellow-800 mt-1 leading-relaxed">
                                Al confirmar, se agregará a <strong>{pendingData?.nuevo_nombre} {pendingData?.nuevo_apellido}</strong> a la base de datos oficial de Crucianelli como <strong>Mecánico Junior</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Datos a registrar</p>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 inline-block min-w-[200px]">
                            <p className="font-medium text-gray-800 text-lg">
                                {pendingData?.nuevo_apellido}, {pendingData?.nuevo_nombre}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Concesionario ID: {pendingData?.concesionario_id}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button onClick={() => setShowConfirmModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                            Cancelar
                        </button>
                        <button onClick={() => pendingData && executeSubmission(pendingData)} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-crucianelli-secondary hover:bg-crucianelli-primary rounded-lg shadow-md flex items-center transition-all">
                            {isSubmitting ? <><Loader2 className="animate-spin w-4 h-4 mr-2" />Guardando...</> : <><UserPlus className="w-4 h-4 mr-2" />Sí, Agregar e Inscribir</>}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}