// frontend/src/components/EditModal.tsx

import { useState, FormEvent, useEffect } from 'react';

// Definimos las Props que el componente recibirá
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => void;
  initialName: string;
  title: string; // Título genérico (ej. "Editar Concesionario")
  label: string; // Etiqueta del input (ej. "Nombre")
}

export default function EditModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialName, 
  title, 
  label 
}: EditModalProps) {
  
  const [name, setName] = useState(initialName);

  // Efecto para resetear el estado del formulario cuando el modal se abre/cierra
  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) { // Evitar envíos vacíos
      onSubmit(name);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-50">
        <h3 className="text-lg leading-6 font-bold text-gray-900 mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="edit-name-input" className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              id="edit-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mt-6 flex flex-row-reverse space-x-4 space-x-reverse">
            <button
              type="submit"
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:w-auto sm:text-sm"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}