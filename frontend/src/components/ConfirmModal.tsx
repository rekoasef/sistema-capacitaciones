// frontend/src/components/ConfirmModal.tsx

import { FiAlertTriangle } from 'react-icons/fi';

// Definimos las "props" que nuestro modal aceptará
interface ConfirmModalProps {
  isOpen: boolean;            // Controla si el modal está visible
  onClose: () => void;        // Función que se ejecuta al cerrar (ej. clic en "Cancelar")
  onConfirm: () => void;      // Función que se ejecuta al confirmar (ej. clic en "Eliminar")
  title: string;              // El título del modal (ej. "¿Eliminar Capacitación?")
  message: string;            // El mensaje de advertencia
  confirmText?: string;       // Texto del botón de confirmación (opcional)
  cancelText?: string;        // Texto del botón de cancelar (opcional)
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}: ConfirmModalProps) {

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) {
    return null;
  }

  return (
    // Fondo oscuro semitransparente
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      {/* Contenedor del Modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-50">
        <div className="flex items-start">
          {/* Icono de Advertencia */}
          <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="ml-4 text-left">
            {/* Título */}
            <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
              {title}
            </h3>
            {/* Mensaje */}
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-6 flex flex-row-reverse space-x-4 space-x-reverse">
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:w-auto sm:text-sm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}