'use client';

import { useForm } from 'react-hook-form'; 
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Plus, Edit, Save, Loader2, XCircle } from 'lucide-react';
import { createConcesionarioAction, updateConcesionarioAction } from '@/lib/actions/concesionario.actions'; // Ruta relativa
import Modal from '@/components/ui/Modal'; // Ruta relativa
import { Database } from '@/types/supabase'; // Ruta relativa

// Tipo para la fila de concesionarios (simplificado para el form)
type Concesionario = Database['public']['Tables']['concesionarios']['Row'];

// Definición de tipos para el formulario (usando Zod para el esquema)
const FormSchema = z.object({
  id: z.coerce.number().optional(), 
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
});

type FormInputs = z.infer<typeof FormSchema>;

interface ConcesionarioFormProps {
  concesionario?: Concesionario; // Opcional: si se pasa, es modo Edición
  onSuccess: () => void;
}

// Componente que contiene el botón de apertura y el modal del formulario
export default function ConcesionarioForm({ concesionario, onSuccess }: ConcesionarioFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!concesionario;
  const modalTitle = isEditMode ? `Editar: ${concesionario?.nombre}` : 'Crear Nuevo Concesionario';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
    //@ts-ignore
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: concesionario?.id,
      nombre: concesionario?.nombre || '',
    },
  });

  // Resetear el formulario cuando se cambia de modo o el modal se abre
  useEffect(() => {
    reset({
      id: concesionario?.id,
      nombre: concesionario?.nombre || '',
    });
    setSubmitError(null);
  }, [concesionario, isOpen, reset]);

  // Manejador de envío del formulario (Tipificación simplificada con FormInputs)
  const onSubmit = async (data: FormInputs) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    // 1. Crear FormData para el Server Action
    const formData = new FormData();
    formData.append('nombre', data.nombre);
    if (data.id) {
        formData.append('id', data.id.toString());
    }

    // 2. Llamar al Server Action (Crear o Actualizar)
    const action = isEditMode ? updateConcesionarioAction : createConcesionarioAction;
    
    // Llamada al Server Action
    const result = await action(null, formData); 

    if (!result.success) {
      // Manejar error de backend (ej: nombre duplicado, no autorizado, etc.)
      setSubmitError(result.message || 'Ocurrió un error inesperado al guardar.');
    } else {
      // Éxito: Cerrar modal y notificar al componente padre
      onSuccess();
      setIsOpen(false);
    }
    
    setIsSubmitting(false);
  };

  // Botón para abrir el modal (depende del modo: Crear o Editar)
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
        {/* @ts-ignore */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Campo Oculto para ID (solo en modo edición) */}
          {isEditMode && (
            <input type="hidden" {...register('id')} />
          )}

          {/* Campo Nombre */}
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