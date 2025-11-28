'use client';

import { useForm, SubmitHandler } from 'react-hook-form'; // Importamos SubmitHandler
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Plus, Edit, Save, Loader2, XCircle } from 'lucide-react';
// Importamos zodResolver pero no lo usamos en useForm
import { zodResolver } from '@hookform/resolvers/zod'; 

// FIX: Rutas ABSOLUTAS @/ para todos los módulos de la raíz
import { createCapacitacionAction, updateCapacitacionAction } from '@/lib/actions/capacitacion.actions'; 
import Modal from '@/components/ui/Modal'; 
import { 
  CapacitacionFormSchema, 
  type CapacitacionRow, 
  ModalidadEnum,
  EstadoCapacitacionEnum
} from '@/types/capacitacion.types'; 

// Definición local del tipo de formulario (basado en el esquema Zod)
type LocalFormInputs = z.infer<typeof CapacitacionFormSchema>;


interface CapacitacionFormProps {
  capacitacion?: CapacitacionRow; // Opcional: si se pasa, es modo Edición
  onSuccess?: () => void; 
}

// Componente que contiene el botón de apertura y el modal del formulario
export default function CapacitacionForm({ capacitacion, onSuccess }: CapacitacionFormProps) { 
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<z.ZodIssue[] | null>(null); // Nuevo estado para errores manuales

  // Aseguramos que onSuccess sea una función
  const handleSuccess = onSuccess ?? (() => {});

  const isEditMode = !!capacitacion;
  const modalTitle = isEditMode ? `Editar: ${capacitacion?.nombre}` : 'Crear Nueva Capacitación';
  
  // Extraemos los valores por defecto del ENUM para el Select (solo para UI)
  const MODALIDADES = ModalidadEnum.options;
  const ESTADOS = EstadoCapacitacionEnum.options;


  // FIX CRÍTICO: ELIMINAMOS EL RESOLVER DE AQUÍ. Usaremos validación manual en onSubmit.
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LocalFormInputs>({
    defaultValues: {
      id: capacitacion?.id ?? undefined, 
      nombre: capacitacion?.nombre || '',
      descripcion: capacitacion?.descripcion || '',
      modalidad: capacitacion?.modalidad || MODALIDADES[0],
      estado: capacitacion?.estado || ESTADOS[0],
    },
  });

  // Resetear el formulario cuando se cambia de modo o el modal se abre
  useEffect(() => {
    reset({
      id: capacitacion?.id ?? undefined, 
      nombre: capacitacion?.nombre || '',
      descripcion: capacitacion?.descripcion || '',
      modalidad: capacitacion?.modalidad || MODALIDADES[0],
      estado: capacitacion?.estado || ESTADOS[0],
    });
    setSubmitError(null);
    setValidationErrors(null); // Limpiar errores
  }, [capacitacion, isOpen, reset]);

  // Manejador de envío del formulario
  // FIX: Usamos SubmitHandler para compatibilidad y removemos la validación de TS en el resolver
  const onSubmit: SubmitHandler<LocalFormInputs> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setValidationErrors(null);
    
    // VALIDACIÓN MANUAL (Reemplaza el zodResolver)
    const resultValidation = CapacitacionFormSchema.safeParse(data);
    if (!resultValidation.success) {
        // Mapear errores de Zod para mostrarlos
        setValidationErrors(resultValidation.error.issues);
        setIsSubmitting(false);
        return;
    }
    
    // 1. Crear FormData para el Server Action (aseguramos tipos de string)
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    formData.append('descripcion', data.descripcion);
    formData.append('modalidad', data.modalidad);
    formData.append('estado', data.estado);
    
    // CRÍTICO: Solo incluimos el ID si está presente
    if (data.id !== undefined) { 
        formData.append('id', data.id.toString());
    }

    // 2. Llamar al Server Action (Crear o Actualizar)
    const action = isEditMode ? updateCapacitacionAction : createCapacitacionAction;
    
    // Llamada al Server Action
    const result = await action(null, formData); 

    if (!result.success) {
      setSubmitError(result.message || 'Ocurrió un error inesperado al guardar.');
    } else {
      // Éxito: Cerrar modal y notificar al componente padre
      handleSuccess(); 
      setIsOpen(false);
    }
    
    setIsSubmitting(false);
  };
  
  // Función para obtener el mensaje de error manual
  const getManualError = (fieldName: keyof LocalFormInputs): string | undefined => {
      if (!validationErrors) return undefined;
      
      const error = validationErrors.find(issue => issue.path.includes(fieldName));
      return error?.message;
  };


  // Botón para abrir el modal (depende del modo: Crear o Editar)
  const renderOpenButton = () => {
    if (isEditMode) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="text-crucianelli-secondary hover:text-crucianelli-primary transition duration-150 p-1 rounded-md"
          title="Editar Capacitación"
        >
          <Edit className="h-5 w-5" />
        </button>
      );
    }
    
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-crucianelli-primary text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition duration-200"
      >
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
          
          {/* Campo Oculto para ID (solo en modo edición) */}
          {isEditMode && (
            <input type="hidden" {...register('id')} />
          )}

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Capacitación
            </label>
            <input
              id="nombre"
              type="text"
              disabled={isSubmitting}
              {...register('nombre')}
              className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none transition duration-150 ${
                errors.nombre || getManualError('nombre') ? 'border-red-500' : 'border-gray-300 focus:border-crucianelli-primary'
              }`}
              placeholder="Ej: Mantenimiento Preventivo de Sembradoras"
            />
            {(errors.nombre || getManualError('nombre')) && <p className="mt-1 text-sm text-red-500 flex items-center"><XCircle className="h-4 w-4 mr-1"/>{errors.nombre?.message || getManualError('nombre')}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción detallada
            </label>
            <textarea
              id="descripcion"
              rows={4}
              disabled={isSubmitting}
              {...register('descripcion')}
              className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none transition duration-150 ${
                errors.descripcion || getManualError('descripcion') ? 'border-red-500' : 'border-gray-300 focus:border-crucianelli-primary'
              }`}
              placeholder="Detalle los objetivos, temario y a quién está dirigido."
            />
            {(errors.descripcion || getManualError('descripcion')) && <p className="mt-1 text-sm text-red-500 flex items-center"><XCircle className="h-4 w-4 mr-1"/>{errors.descripcion?.message || getManualError('descripcion')}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Modalidad */}
            <div>
              <label htmlFor="modalidad" className="block text-sm font-medium text-gray-700 mb-1">
                Modalidad
              </label>
              <select
                id="modalidad"
                disabled={isSubmitting}
                {...register('modalidad')}
                className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none transition duration-150 ${
                  errors.modalidad || getManualError('modalidad') ? 'border-red-500' : 'border-gray-300 focus:border-crucianelli-primary'
                }`}
              >
                {MODALIDADES.map((mod) => (
                    // Aseguramos que la primera letra sea mayúscula para la UI
                    <option key={mod} value={mod}>{mod.charAt(0).toUpperCase() + mod.slice(1)}</option> 
                ))}
              </select>
              {(errors.modalidad || getManualError('modalidad')) && <p className="mt-1 text-sm text-red-500 flex items-center"><XCircle className="h-4 w-4 mr-1"/>{errors.modalidad?.message || getManualError('modalidad')}</p>}
            </div>

            {/* Estado */}
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="estado"
                disabled={isSubmitting}
                {...register('estado')}
                className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none transition duration-150 ${
                  errors.estado || getManualError('estado') ? 'border-red-500' : 'border-gray-300 focus:border-crucianelli-primary'
                }`}
              >
                {ESTADOS.map((est) => (
                    // Aseguramos que la primera letra sea mayúscula para la UI
                    <option key={est} value={est}>{est.charAt(0).toUpperCase() + est.slice(1)}</option> 
                ))}
              </select>
              {(errors.estado || getManualError('estado')) && <p className="mt-1 text-sm text-red-500 flex items-center"><XCircle className="h-4 w-4 mr-1"/>{errors.estado?.message || getManualError('estado')}</p>}
            </div>
            
          </div> {/* Fin grid */}

          {/* Mensaje de Error (Backend / Server Action) */}
          {submitError && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg font-medium flex items-center">
              <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {submitError}
            </div>
          )}

          {/* Botón de Submit */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center py-2 px-4 rounded-lg shadow-md text-base font-medium text-white transition duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-crucianelli-secondary hover:bg-crucianelli-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crucianelli-primary'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {isEditMode ? 'Guardar Cambios' : 'Crear Capacitación'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}