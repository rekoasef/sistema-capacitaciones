'use client';

import { useForm, SubmitHandler } from 'react-hook-form'; 
import { z } from 'zod';
import { useState, useEffect, useMemo } from 'react'; // Importamos useMemo
import { Plus, Edit, Save, Loader2, XCircle, MapPin } from 'lucide-react';
// Importamos toast de sonner
import { toast } from 'sonner';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<z.ZodIssue[] | null>(null);

  const handleSuccess = onSuccess ?? (() => {});
  const isEditMode = !!capacitacion;
  const modalTitle = isEditMode ? `Editar: ${capacitacion?.nombre}` : 'Crear Nueva Capacitación';
  
  // FIX: Memorizamos las opciones para incluirlas en dependencias sin causar loops
  const MODALIDADES = useMemo(() => ModalidadEnum.options, []);
  const ESTADOS = useMemo(() => EstadoCapacitacionEnum.options, []);

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

  const selectedModalidad = watch('modalidad');
  const showUbicacion = selectedModalidad === 'presencial' || selectedModalidad === 'hibrido';

  useEffect(() => {
    if (isOpen) {
      reset({
        id: capacitacion?.id ?? undefined, 
        nombre: capacitacion?.nombre || '',
        descripcion: capacitacion?.descripcion || '',
        modalidad: capacitacion?.modalidad || MODALIDADES[0],
        estado: capacitacion?.estado || ESTADOS[0],
        ubicacion: capacitacion?.ubicacion || '',
      });
      setValidationErrors(null); 
    }
  }, [capacitacion, isOpen, reset, MODALIDADES, ESTADOS]); // Agregamos dependencias

  const onSubmit: SubmitHandler<LocalFormInputs> = async (data) => {
    setIsSubmitting(true);
    setValidationErrors(null);
    
    // Validación local con Zod antes de enviar
    const resultValidation = CapacitacionFormSchema.safeParse(data);
    if (!resultValidation.success) {
        setValidationErrors(resultValidation.error.issues);
        setIsSubmitting(false);
        // Feedback visual inmediato si hay error de validación
        toast.error('Datos inválidos. Revisa el formulario.');
        return;
    }
    
    // Toast de carga
    const toastId = toast.loading(isEditMode ? 'Guardando cambios...' : 'Creando capacitación...');

    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('descripcion', data.descripcion);
    formData.append('modalidad', data.modalidad);
    formData.append('estado', data.estado);
    if (data.ubicacion) formData.append('ubicacion', data.ubicacion);
    
    if (data.id !== undefined) { 
        formData.append('id', data.id.toString());
    }

    const action = isEditMode ? updateCapacitacionAction : createCapacitacionAction;
    
    try {
      const result = await action(null, formData); 

      if (!result.success) {
        // Error del servidor
        toast.dismiss(toastId);
        toast.error(result.message || 'Error al procesar la solicitud.');
      } else {
        // Éxito
        toast.dismiss(toastId);
        toast.success(result.message || '¡Guardado correctamente!');
        handleSuccess(); 
        setIsOpen(false);
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Error de conexión inesperado.');
    } finally {
      setIsSubmitting(false);
    }
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

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input id="nombre" type="text" disabled={isSubmitting} {...register('nombre')} className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none transition duration-150 ${errors.nombre || getManualError('nombre') ? 'border-red-500' : 'border-gray-300 focus:border-crucianelli-primary'}`} placeholder="Ej: Mantenimiento Preventivo" />
            {(errors.nombre || getManualError('nombre')) && <p className="mt-1 text-sm text-red-500 flex items-center"><XCircle className="h-4 w-4 mr-1"/>{errors.nombre?.message || getManualError('nombre')}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea id="descripcion" rows={3} disabled={isSubmitting} {...register('descripcion')} className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none transition duration-150 ${errors.descripcion || getManualError('descripcion') ? 'border-red-500' : 'border-gray-300 focus:border-crucianelli-primary'}`} placeholder="Detalles del curso..." />
            {(errors.descripcion || getManualError('descripcion')) && <p className="mt-1 text-sm text-red-500 flex items-center"><XCircle className="h-4 w-4 mr-1"/>{errors.descripcion?.message || getManualError('descripcion')}</p>}
          </div>

          {/* Selectores */}
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

          {/* Ubicación (Condicional) */}
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

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button 
                type="button" 
                onClick={() => setIsOpen(false)} 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
                Cancelar
            </button>
            <button 
                type="submit" 
                disabled={isSubmitting} 
                className={`flex items-center px-4 py-2 rounded-lg shadow-md text-sm font-medium text-white transition duration-200 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-crucianelli-secondary hover:bg-crucianelli-primary'}`}
            >
              {isSubmitting ? <><Loader2 className="animate-spin h-4 w-4 mr-2" />Guardando...</> : <><Save className="w-4 h-4 mr-2" />{isEditMode ? 'Guardar Cambios' : 'Crear'}</>}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}