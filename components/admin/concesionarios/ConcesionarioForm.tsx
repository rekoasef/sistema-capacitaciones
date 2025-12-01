'use client';

import { useForm } from 'react-hook-form'; 
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Plus, Edit, Save, Loader2, XCircle } from 'lucide-react';
import { createConcesionarioAction, updateConcesionarioAction } from '@/lib/actions/concesionario.actions';
import Modal from '@/components/ui/Modal';
import { Database } from '@/types/supabase';

type Concesionario = Database['public']['Tables']['concesionarios']['Row'];

const FormSchema = z.object({
  id: z.coerce.number().optional(), 
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
});

type FormInputs = z.infer<typeof FormSchema>;

interface ConcesionarioFormProps {
  concesionario?: Concesionario;
  // FIX: Hacemos esta prop OPCIONAL para no obligar al Server Component a enviarla
  onSuccess?: () => void; 
}

export default function ConcesionarioForm({ concesionario, onSuccess }: ConcesionarioFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!concesionario;
  const modalTitle = isEditMode ? `Editar: ${concesionario?.nombre}` : 'Crear Nuevo Concesionario';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
    // @ts-ignore
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: concesionario?.id,
      nombre: concesionario?.nombre || '',
    },
  });

  useEffect(() => {
    reset({
      id: concesionario?.id,
      nombre: concesionario?.nombre || '',
    });
    setSubmitError(null);
  }, [concesionario, isOpen, reset]);

  const onSubmit = async (data: FormInputs) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    if (data.id) {
        formData.append('id', data.id.toString());
    }

    const action = isEditMode ? updateConcesionarioAction : createConcesionarioAction;
    const result = await action(null, formData); 

    if (!result.success) {
      setSubmitError(result.message || 'Ocurrió un error inesperado al guardar.');
    } else {
      // FIX: Solo llamamos a onSuccess si fue provisto
      if (onSuccess) onSuccess();
      setIsOpen(false);
    }
    
    setIsSubmitting(false);
  };

  const renderOpenButton = () => {
    if (isEditMode) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="text-crucianelli-secondary hover:text-crucianelli-primary transition duration-150 p-1 rounded-md"
          title="Editar Concesionario"
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
        <span>Nuevo Concesionario</span>
      </button>
    );
  };

  return (
    <>
      {renderOpenButton()}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={modalTitle}>
        {/*@ts-ignore*/}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {isEditMode && (
            <input type="hidden" {...register('id')} />
          )}

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Concesionario
            </label>
            <input
              id="nombre"
              type="text"
              disabled={isSubmitting}
              {...register('nombre')}
              className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none transition duration-150 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300 focus:border-crucianelli-primary'
              }`}
              placeholder="Ej: Concesionario La Tranquera S.A."
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-500 flex items-center"><XCircle className="h-4 w-4 mr-1"/>{errors.nombre.message}</p>}
          </div>

          {submitError && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg font-medium flex items-center">
              <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {submitError}
            </div>
          )}

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
                  {isEditMode ? 'Guardar Cambios' : 'Crear Concesionario'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}