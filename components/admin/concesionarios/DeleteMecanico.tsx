'use client';

import { Trash, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTransition, useState } from 'react';
import { deleteMecanicoAction } from '@/lib/actions/mecanico.actions';

interface DeleteMecanicoProps {
  id: number;
  nombre: string;
  concesionarioId: number; // Necesario para refrescar la lista correcta
}

export default function DeleteMecanico({ id, nombre, concesionarioId }: DeleteMecanicoProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = () => {
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar al mecánico "${nombre}"?`);
    
    if (confirmed) {
      setIsDeleting(true);
      setError(null);
      setSuccess(false);

      startTransition(async () => {
        const result = await deleteMecanicoAction(id, concesionarioId);
        
        if (!result.success) {
          setError(result.message || 'Error al eliminar.');
          setIsDeleting(false);
        } else {
          setSuccess(true);
          // Feedback visual temporal
          setTimeout(() => {
            setSuccess(false);
            setIsDeleting(false);
          }, 3000);
        }
      });
    }
  };

  if (success) {
    // @ts-ignore: Ignoramos error de tipo en title para iconos Lucide
    return <CheckCircle className="h-5 w-5 text-green-500" title="Eliminado con éxito" />;
  }

  if (error) {
    return (
        <button 
            type="button"
            className="text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors"
            title={error} 
            onClick={() => setError(null)}
        >
            <AlertTriangle className="h-5 w-5" />
        </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending || isDeleting}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 transition duration-150 p-1 rounded-md"
      title={`Eliminar a ${nombre}`}
    >
      {isPending || isDeleting ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Trash className="h-5 w-5" />
      )}
    </button>
  );
}