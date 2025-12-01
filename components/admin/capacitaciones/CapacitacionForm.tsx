'use client';

import { useForm, SubmitHandler } from 'react-hook-form'; 
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Plus, Edit, Save, Loader2, XCircle, MapPin } from 'lucide-react';
import { createCapacitacionAction, updateCapacitacionAction } from '@/lib/actions/capacitacion.actions'; 
import Modal from '@/components/ui/Modal'; 
import { 
  CapacitacionFormSchema, 
  type CapacitacionRow, 
  ModalidadEnum,
  EstadoCapacitacionEnum
} from '@/types/capacitacion.types'; 

type LocalFormInputs = z.infer<typeof CapacitacionFormSchema>;

interface CapacitacionFormProps {
  capacitacion?: CapacitacionRow; 
  onSuccess?: () => void; 
}

export default function CapacitacionForm({ capacitacion, onSuccess }: CapacitacionFormProps) { 
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<z.ZodIssue[] | null>(null);

  const handleSuccess = onSuccess ?? (() => {});
  const isEditMode = !!capacitacion;
  const modalTitle = isEditMode ? `Editar: ${capacitacion?.nombre}` : 'Crear Nueva Capacitación';
  
  const MODALIDADES = ModalidadEnum.options;
  const ESTADOS = EstadoCapacitacionEnum.options;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<LocalFormInputs>({
    defaultValues: {
      id: capacitacion?.id ?? undefined, 
      nombre: capacitacion?.nombre || '',
      descripcion: capacitacion?.descripcion || '',
      modalidad: capacitacion?.modalidad || MODALIDADES[0],
      estado: capacitacion?.estado || ESTADOS[0],
      ubicacion: capacitacion?.ubicacion || '',
    },
  });

  // Observamos la modalidad para mostrar/ocultar ubicación
  const selectedModalidad = watch('modalidad');
  const showUbicacion = selectedModalidad === 'presencial' || selectedModalidad === 'hibrido';

  useEffect(() => {
    reset({
      id: capacitacion?.id ?? undefined, 
      nombre: capacitacion?.nombre || '',
      descripcion: capacitacion?.descripcion || '',
      modalidad: capacitacion?.modalidad || MODALIDADES[0],
      estado: capacitacion?.estado || ESTADOS[0],
      ubicacion: capacitacion?.ubicacion || '',
    });
    setSubmitError(null);
    setValidationErrors(null); 
  }, [capacitacion, isOpen, reset]);

  const onSubmit: SubmitHandler<LocalFormInputs> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setValidationErrors(null);
    
    const resultValidation = CapacitacionFormSchema.safeParse(data);
    if (!resultValidation.success) {
        setValidationErrors(resultValidation.error.issues);
        setIsSubmitting(false);
        return;
    }
    
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('descripcion', data.descripcion);
    formData.append('modalidad', data.modalidad);
    formData.append('estado', data.estado);
    // Agregamos ubicación si corresponde
    if (data.ubicacion) formData.append('ubicacion', data.ubicacion);
    
    if (data.id !== undefined) { 
        formData.append('id', data.id.toString());
    }

    const action = isEditMode ? updateCapacitacionAction : createCapacitacionAction;
    const result = await action(null, formData); 

    if (!result.success) {
      setSubmitError(result.message || 'Ocurrió un error inesperado al guardar.');
    } else {
      handleSuccess(); 
      setIsOpen(false);
    }
    
    setIsSubmitting(false);
  };
  
  const getManualError = (fieldName: keyof LocalFormInputs): string | undefined => {
      if (!validationErrors) return undefined;
      const error = validationErrors.find(issue => issue.path.includes(fieldName));
      return error?.message;
  };

  const renderOpenButton = () => {
    if (isEditMode) {
      return (
        <button onClick={() => setIsOpen(true)} className="text-crucianelli-secondary hover:text-crucianelli-primary transition duration-150 p-1 rounded-md" title="Editar Capacitación">
          <Edit className="h-5 w-5" />
        </button>
      );
    }
    return (
      <button onClick={() => setIsOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-crucianelli-primary text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition duration-200">
        <Plus className="h-5 w-5" />
        <span>Nueva Capacitación</span>
      </button>
    );
  };

  return (
    <>
      {renderOpenButton()}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={modalTitle}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {isEditMode && <input type="hidden" {...register('id')} />}

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input id="nombre" type="text" disabled={isSubmitting} {...register('nombre')} className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none transition duration-150 ${errors.nombre || getManualError('nombre') ? 'border-red-500' : 'border-gray-300 focus:border-crucianelli-primary'}`} placeholder="Ej: Mantenimiento Preventivo" />
            {(errors.nombre || getManualError('nombre')) && <p className="mt-1 text-sm text-red-500 flex items-center"><XCircle className="h-4 w-4 mr-1"/>{errors.nombre?.message || getManualError('nombre')}</p>}
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea id="descripcion" rows={3} disabled={isSubmitting} {...register('descripcion')} className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none transition duration-150 ${errors.descripcion || getManualError('descripcion') ? 'border-red-500' : 'border-gray-300 focus:border-crucianelli-primary'}`} placeholder="Detalles del curso..." />
            {(errors.descripcion || getManualError('descripcion')) && <p className="mt-1 text-sm text-red-500 flex items-center"><XCircle className="h-4 w-4 mr-1"/>{errors.descripcion?.message || getManualError('descripcion')}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="modalidad" className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
              <select id="modalidad" disabled={isSubmitting} {...register('modalidad')} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-crucianelli-primary focus:outline-none">
                {MODALIDADES.map((mod) => (<option key={mod} value={mod}>{mod.charAt(0).toUpperCase() + mod.slice(1)}</option>))}
              </select>
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select id="estado" disabled={isSubmitting} {...register('estado')} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-crucianelli-primary focus:outline-none">
                {ESTADOS.map((est) => (<option key={est} value={est}>{est.charAt(0).toUpperCase() + est.slice(1)}</option>))}
              </select>
            </div>
          </div>

          {/* CAMPO CONDICIONAL: Ubicación */}
          {showUbicacion && (
             <div className="animate-fade-in">
                <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">Lugar / Dirección</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                        id="ubicacion" 
                        type="text" 
                        disabled={isSubmitting} 
                        {...register('ubicacion')} 
                        className={`pl-10 w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none transition duration-150 ${getManualError('ubicacion') ? 'border-red-500' : 'border-gray-300 focus:border-crucianelli-primary'}`} 
                        placeholder="Ej: Planta Industrial, Armstrong" 
                    />
                </div>
                {getManualError('ubicacion') && <p className="mt-1 text-sm text-red-500 flex items-center"><XCircle className="h-4 w-4 mr-1"/>{getManualError('ubicacion')}</p>}
             </div>
          )}

          {submitError && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg font-medium flex items-center">
              <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {submitError}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={isSubmitting} className={`flex items-center py-2 px-4 rounded-lg shadow-md text-base font-medium text-white transition duration-200 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-crucianelli-secondary hover:bg-crucianelli-primary'}`}>
              {isSubmitting ? <><Loader2 className="animate-spin h-5 w-5 mr-2" />Guardando...</> : <><Save className="w-5 h-5 mr-2" />{isEditMode ? 'Guardar Cambios' : 'Crear Capacitación'}</>}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}