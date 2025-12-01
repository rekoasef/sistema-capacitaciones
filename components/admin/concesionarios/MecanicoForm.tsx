'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Plus, Edit, Save, Loader2, XCircle, User, Wrench } from 'lucide-react';

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
    const [serverError, setServerError] = useState<string | null>(null);
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
            setServerError(null);
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
        setServerError(null);

        try {
            let result;
            if (isEditMode) {
                result = await updateMecanicoAction(data);
            } else {
                result = await createMecanicoAction(data);
            }

            if (!result.success) {
                setServerError(result.message || 'Error al guardar.');
            } else {
                setIsOpen(false);
            }
        } catch (error) {
            setServerError('Ocurrió un error inesperado.');
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input {...register('nombre')} className="w-full rounded-md border px-3 py-2 text-sm border-gray-300" placeholder="Juan" />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                            <input {...register('apellido')} className="w-full rounded-md border px-3 py-2 text-sm border-gray-300" placeholder="Pérez" />
                            {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol / Puesto</label>
                            <input {...register('rol')} className="w-full rounded-md border px-3 py-2 text-sm border-gray-300" placeholder="Mecánico" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Técnico</label>
                            <select {...register('nivel')} className="w-full rounded-md border px-3 py-2 text-sm border-gray-300 bg-white">
                                {NivelMecanicoEnum.options.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {serverError && <div className="text-red-600 text-sm">{serverError}</div>}

                    <div className="flex justify-end pt-4 border-t">
                        <button type="button" onClick={() => setIsOpen(false)} className="mr-3 text-sm text-gray-600">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="bg-crucianelli-secondary text-white px-4 py-2 rounded-md text-sm">
                            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4 mr-2 inline" />}
                            Guardar
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}