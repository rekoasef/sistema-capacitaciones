'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Plus, Edit, Save, Loader2, User } from 'lucide-react';
// Importamos toast
import { toast } from 'sonner';

import Modal from '@/components/ui/Modal';
import { createMecanicoAction, updateMecanicoAction } from '@/lib/actions/mecanico.actions';
import { 
    MecanicoFormSchema, 
    MecanicoFormInputs, 
    MecanicoRow, 
    NivelMecanicoEnum 
} from '@/types/mecanico.types';

interface MecanicoFormProps {
    concesionarioId: number;
    mecanicoToEdit?: MecanicoRow;
}

export default function MecanicoForm({ concesionarioId, mecanicoToEdit }: MecanicoFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    // Eliminamos serverError
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = !!mecanicoToEdit;
    const modalTitle = isEditMode ? `Editar Mecánico` : 'Registrar Nuevo Mecánico';

    const { 
        register, 
        handleSubmit, 
        reset, 
        formState: { errors } 
    } = useForm<MecanicoFormInputs>({
        // @ts-ignore: Ignoramos conflicto de tipos
        resolver: zodResolver(MecanicoFormSchema),
        defaultValues: {
            concesionario_id: concesionarioId,
            nombre: '',
            apellido: '',
            rol: 'Mecánico',
            nivel: 'Junior'
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (mecanicoToEdit) {
                reset({
                    id: mecanicoToEdit.id,
                    concesionario_id: mecanicoToEdit.concesionario_id,
                    nombre: mecanicoToEdit.nombre,
                    apellido: mecanicoToEdit.apellido,
                    rol: mecanicoToEdit.rol || 'Mecánico',
                    nivel: mecanicoToEdit.nivel
                });
            } else {
                reset({
                    concesionario_id: concesionarioId,
                    nombre: '',
                    apellido: '',
                    rol: 'Mecánico',
                    nivel: 'Junior'
                });
            }
        }
    }, [isOpen, mecanicoToEdit, concesionarioId, reset]);

    const onSubmit: SubmitHandler<MecanicoFormInputs> = async (data) => {
        setIsSubmitting(true);
        
        // Iniciamos toast de carga
        const toastId = toast.loading(isEditMode ? 'Actualizando datos...' : 'Registrando mecánico...');

        try {
            let result;
            if (isEditMode) {
                result = await updateMecanicoAction(data);
            } else {
                result = await createMecanicoAction(data);
            }

            if (!result.success) {
                // Error
                toast.dismiss(toastId);
                toast.error(result.message || 'Error al guardar.', {
                    description: 'Revisa los datos e intenta nuevamente.'
                });
            } else {
                // Éxito
                toast.dismiss(toastId);
                toast.success(result.message || 'Operación exitosa.');
                setIsOpen(false);
            }
        } catch (error) {
            toast.dismiss(toastId);
            toast.error('Ocurrió un error inesperado de conexión.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {isEditMode ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-crucianelli-secondary hover:text-crucianelli-primary p-1 rounded-md transition-colors"
                    title="Editar Mecánico"
                >
                    <Edit className="h-5 w-5" />
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center space-x-2 bg-crucianelli-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    <span>Nuevo Mecánico</span>
                </button>
            )}

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={modalTitle}>
                {/*@ts-ignore*/}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {isEditMode && <input type="hidden" {...register('id')} />}
                    <input type="hidden" {...register('concesionario_id')} />

                    {/* Icono decorativo en el form */}
                    <div className="flex justify-center pb-2">
                        <div className="bg-gray-100 p-3 rounded-full">
                            <User className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input {...register('nombre')} className="w-full rounded-md border px-3 py-2 text-sm border-gray-300 focus:ring-crucianelli-primary focus:border-crucianelli-primary outline-none transition" placeholder="Juan" />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                            <input {...register('apellido')} className="w-full rounded-md border px-3 py-2 text-sm border-gray-300 focus:ring-crucianelli-primary focus:border-crucianelli-primary outline-none transition" placeholder="Pérez" />
                            {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol / Puesto</label>
                            <input {...register('rol')} className="w-full rounded-md border px-3 py-2 text-sm border-gray-300 focus:ring-crucianelli-primary focus:border-crucianelli-primary outline-none" placeholder="Mecánico" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Técnico</label>
                            <select {...register('nivel')} className="w-full rounded-md border px-3 py-2 text-sm border-gray-300 bg-white focus:ring-crucianelli-primary outline-none">
                                {NivelMecanicoEnum.options.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Eliminamos el div de serverError aquí */}

                    <div className="flex justify-end pt-4 border-t gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsOpen(false)} 
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="bg-crucianelli-secondary hover:bg-crucianelli-primary text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors flex items-center"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            {isEditMode ? 'Guardar Cambios' : 'Registrar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}