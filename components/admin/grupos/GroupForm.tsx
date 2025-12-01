'use client';

import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Plus, Edit, Save, Loader2, Trash2, CalendarPlus, AlertTriangle } from 'lucide-react';

import Modal from '@/components/ui/Modal';
// Importamos ambas acciones: crear y actualizar
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
    const [serverError, setServerError] = useState<string | null>(null);
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
            setServerError(null);
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
        setServerError(null);

        try {
            // Tipado explícito para evitar error de inferencia de TS
            let result: { success: boolean; message: string };
            
            if (isEditMode) {
                // Acción de Actualización (Smart Update)
                result = await updateGrupoAction(data);
            } else {
                // Acción de Creación
                result = await createGrupoAction(data);
            }

            if (!result.success) {
                setServerError(result.message || 'Error al guardar el grupo.');
            } else {
                setIsOpen(false);
                reset(); // Limpia el formulario al cerrar si fue exitoso
            }
        } catch (error) {
            console.error(error);
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Datos Generales */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Datos Generales</h3>
                        
                        {/* Campo Oculto para ID (Importante para el Update) */}
                        {isEditMode && <input type="hidden" {...register('id')} />}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Identificador</label>
                            <input
                                {...register('nombre_grupo')}
                                placeholder="Ej: Grupo 1 - Turno Mañana"
                                className={`w-full rounded-md border px-3 py-2 text-sm focus:ring-crucianelli-primary ${errors.nombre_grupo ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.nombre_grupo && <p className="text-red-500 text-xs mt-1">{errors.nombre_grupo.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cupo Máximo</label>
                                <input
                                    type="number"
                                    {...register('cupo_maximo')}
                                    className={`w-full rounded-md border px-3 py-2 text-sm ${errors.cupo_maximo ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.cupo_maximo && <p className="text-red-500 text-xs mt-1">{errors.cupo_maximo.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    {...register('estado')}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm capitalize"
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
                                className="text-xs flex items-center text-crucianelli-secondary hover:text-crucianelli-primary font-medium"
                            >
                                <CalendarPlus className="w-4 h-4 mr-1" />
                                Agregar Día
                            </button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-2 p-3 bg-white border rounded-md shadow-sm relative group">
                                {/* Input oculto para ID del día (si existe) */}
                                <input type="hidden" {...register(`dias.${index}.id`)} />

                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 block mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        {...register(`dias.${index}.fecha`)}
                                        className={`w-full rounded border px-2 py-1 text-sm ${errors.dias?.[index]?.fecha ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.dias?.[index]?.fecha && <p className="text-red-500 text-[10px] mt-1">{errors.dias[index]?.fecha?.message}</p>}
                                </div>

                                <div className="w-24">
                                    <label className="text-xs text-gray-500 block mb-1">Inicio</label>
                                    <input
                                        type="time"
                                        {...register(`dias.${index}.hora_inicio`)}
                                        className={`w-full rounded border px-2 py-1 text-sm ${errors.dias?.[index]?.hora_inicio ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                </div>

                                <div className="w-24">
                                    <label className="text-xs text-gray-500 block mb-1">Fin</label>
                                    <input
                                        type="time"
                                        {...register(`dias.${index}.hora_fin`)}
                                        className={`w-full rounded border px-2 py-1 text-sm ${errors.dias?.[index]?.hora_fin ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.dias?.[index]?.hora_fin && <p className="text-red-500 text-[10px] mt-1 absolute -bottom-4 right-0">{errors.dias[index]?.hora_fin?.message}</p>}
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
                        {errors.dias && <p className="text-red-500 text-sm text-center">{errors.dias.message}</p>}
                    </div>

                    {serverError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700 text-sm">
                            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                            {serverError}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 mr-3"
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