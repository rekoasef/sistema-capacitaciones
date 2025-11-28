'use client';

import { Trash, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTransition, useState } from 'react';
import { deleteCapacitacionAction } from '@/lib/actions/capacitacion.actions'; // Ruta relativa

interface DeleteCapacitacionProps {
  id: number;
  name: string;
}

// Componente Client para manejar la acción de eliminación de Capacitaciones
export default function DeleteCapacitacion({ id, name }: DeleteCapacitacionProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Manejador de la confirmación y la Server Action
  const handleDelete = () => {
    // Implementación de modal de confirmación simple (en lugar de alert())
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar la capacitación "${name}"? ADVERTENCIA: Esto eliminará también todos los grupos asociados.`);
    
    if (confirmed) {
      setIsDeleting(true);
      setError(null);
      setSuccess(false);

      startTransition(async () => {
        const result = await deleteCapacitacionAction(id);
        
        if (!result.success) {
          // Captura errores de FK (si tiene grupos asociados) o de autorización
          setError(result.message || 'Error desconocido al eliminar.');
          setIsDeleting(false);
        } else {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000); 
          setIsDeleting(false);
        }
      });
    }
  };

  if (success) {
    //@ts-ignore
    return <CheckCircle className="h-5 w-5 text-green-500" title="Eliminado con éxito" />;
  }

  if (error) {
    return (
        <span 
            className="text-red-500 cursor-pointer" 
            title={error} 
            onClick={() => setError(null)}
        >
            <AlertTriangle className="h-5 w-5" />
        </span>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending || isDeleting}
      className="text-red-500 hover:text-red-700 transition duration-150 p-1 rounded-md"
      title={`Eliminar ${name}`}
    >
      {isPending || isDeleting ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Trash className="h-5 w-5" />
      )}
    </button>
  );
}