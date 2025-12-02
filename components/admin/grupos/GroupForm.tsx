'use client';

import { useForm, useFieldArray, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Plus, Edit, Save, Loader2, Trash2, CalendarPlus } from 'lucide-react';
// Importamos toast de sonner
import { toast } from 'sonner';

import Modal from '@/components/ui/Modal';
import { createGrupoAction, updateGrupoAction } from '@/lib/actions/grupo.actions';
import { 
    GrupoFormSchema, 
    GrupoFormInputs, 
    GrupoWithDias, 
    EstadoGrupoEnum 
} from '@/types/grupo.types';

interface GroupFormProps {
    capacitacionId: number;
    grupoToEdit?: GrupoWithDias; 
}

export default function GroupForm({ capacitacionId, grupoToEdit }: GroupFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    // Eliminamos serverError
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = !!grupoToEdit;
    const modalTitle = isEditMode ? `Editar Grupo: ${grupoToEdit.nombre_grupo}` : 'Crear Nuevo Grupo';

    const { 
        register, 
        control, 
        handleSubmit, 
        reset, 
        formState: { errors } 
    } = useForm<GrupoFormInputs>({
        // @ts-ignore: Ignoramos conflicto de tipos estricto entre Zod y RHF
        resolver: zodResolver(GrupoFormSchema),
        defaultValues: {
            capacitacion_id: capacitacionId,
            nombre_grupo: '',
            cupo_maximo: 30,
            estado: 'activo',
            dias: [{ fecha: '', hora_inicio: '09:00', hora_fin: '12:00' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "dias"
    });

    useEffect(() => {
        if (isOpen) {
            if (grupoToEdit) {
                reset({
                    id: grupoToEdit.id,
                    capacitacion_id: capacitacionId,
                    nombre_grupo: grupoToEdit.nombre_grupo || '',
                    cupo_maximo: grupoToEdit.cupo_maximo,
                    estado: grupoToEdit.estado,
                    dias: grupoToEdit.dias.map(d => ({
                        id: d.id,
                        fecha: d.fecha,
                        hora_inicio: d.hora_inicio?.slice(0,5) || '',
                        hora_fin: d.hora_fin?.slice(0,5) || ''
                    }))
                });
            } else {
                reset({
                    capacitacion_id: capacitacionId,
                    nombre_grupo: '',
                    cupo_maximo: 30,
                    estado: 'activo',
                    dias: [{ fecha: '', hora_inicio: '09:00', hora_fin: '13:00' }]
                });
            }
        }
    }, [isOpen, grupoToEdit, capacitacionId, reset]);

    const onSubmit: SubmitHandler<GrupoFormInputs> = async (data) => {
        setIsSubmitting(true);
        // Toast de carga
        const toastId = toast.loading(isEditMode ? 'Actualizando cronograma...' : 'Creando grupo...');

        try {
            let result: { success: boolean; message: string };
            
            if (isEditMode) {
                result = await updateGrupoAction(data);
            } else {
                result = await createGrupoAction(data);
            }

            if (!result.success) {
                toast.dismiss(toastId);
                toast.error(result.message || 'Error al guardar el grupo.');
            } else {
                toast.dismiss(toastId);
                toast.success(result.message || '¡Grupo guardado con éxito!');
                setIsOpen(false);
                if (!isEditMode) reset(); // Limpia solo si se creó uno nuevo
            }
        } catch (error) {
            console.error(error);
            toast.dismiss(toastId);
            toast.error('Ocurrió un error inesperado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Callback para cuando hay errores de validación en el formulario (ej: fechas vacías)
    const onInvalid: SubmitErrorHandler<GrupoFormInputs> = (errors) => {
        console.log("Errores de validación:", errors);
        toast.error("Por favor, corrige los campos marcados en rojo.");
    };

    return (
        <>
            {isEditMode ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-crucianelli-secondary hover:text-crucianelli-primary p-1 rounded-md transition-colors"
                    title="Editar Grupo"
                >
                    <Edit className="h-5 w-5" />
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center space-x-2 bg-crucianelli-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    <span>Nuevo Grupo</span>
                </button>
            )}

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={modalTitle}>
                {/* @ts-ignore */}
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                    
                    {/* Datos Generales */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Datos Generales</h3>
                        
                        {isEditMode && <input type="hidden" {...register('id')} />}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Identificador</label>
                            <input
                                {...register('nombre_grupo')}
                                placeholder="Ej: Grupo 1 - Turno Mañana"
                                className={`w-full rounded-md border px-3 py-2 text-sm focus:ring-crucianelli-primary focus:outline-none ${errors.nombre_grupo ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.nombre_grupo && <p className="text-red-500 text-xs mt-1">{errors.nombre_grupo.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cupo Máximo</label>
                                <input
                                    type="number"
                                    {...register('cupo_maximo')}
                                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${errors.cupo_maximo ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.cupo_maximo && <p className="text-red-500 text-xs mt-1">{errors.cupo_maximo.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    {...register('estado')}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm capitalize focus:outline-none"
                                >
                                    {EstadoGrupoEnum.options.map(st => (
                                        <option key={st} value={st}>{st}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Cronograma Dinámico */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Días de Cursado</h3>
                            <button
                                type="button"
                                onClick={() => append({ fecha: '', hora_inicio: '', hora_fin: '' })}
                                className="text-xs flex items-center text-crucianelli-secondary hover:text-crucianelli-primary font-medium transition-colors"
                            >
                                <CalendarPlus className="w-4 h-4 mr-1" />
                                Agregar Día
                            </button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-2 p-3 bg-white border rounded-md shadow-sm relative group animate-fade-in">
                                <input type="hidden" {...register(`dias.${index}.id`)} />

                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 block mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        {...register(`dias.${index}.fecha`)}
                                        className={`w-full rounded border px-2 py-1 text-sm focus:outline-none ${errors.dias?.[index]?.fecha ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.dias?.[index]?.fecha && <p className="text-red-500 text-[10px] mt-1">{errors.dias[index]?.fecha?.message}</p>}
                                </div>

                                <div className="w-24">
                                    <label className="text-xs text-gray-500 block mb-1">Inicio</label>
                                    <input
                                        type="time"
                                        {...register(`dias.${index}.hora_inicio`)}
                                        className={`w-full rounded border px-2 py-1 text-sm focus:outline-none ${errors.dias?.[index]?.hora_inicio ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                </div>

                                <div className="w-24">
                                    <label className="text-xs text-gray-500 block mb-1">Fin</label>
                                    <input
                                        type="time"
                                        {...register(`dias.${index}.hora_fin`)}
                                        className={`w-full rounded border px-2 py-1 text-sm focus:outline-none ${errors.dias?.[index]?.hora_fin ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.dias?.[index]?.hora_fin && <p className="text-red-500 text-[10px] mt-1 absolute -bottom-4 right-0 bg-white px-1 border border-red-100 rounded z-10">{errors.dias[index]?.hora_fin?.message}</p>}
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Quitar día"
                                        disabled={fields.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {errors.dias && <p className="text-red-500 text-sm text-center bg-red-50 p-1 rounded">{errors.dias.message}</p>}
                    </div>

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
                            className={`flex items-center px-6 py-2 rounded-lg text-white font-medium shadow-md transition-all ${
                                isSubmitting ? 'bg-gray-400 cursor-wait' : 'bg-crucianelli-secondary hover:bg-crucianelli-primary'
                            }`}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5 mr-2" />}
                            {isEditMode ? 'Guardar Cambios' : 'Crear Grupo'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}