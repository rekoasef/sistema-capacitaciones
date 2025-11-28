'use client';

import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Modal Componente Genérico (Client Component)
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    // Fondo oscuro con efecto de desenfoque
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300" onClick={onClose}>
      
      {/* Contenedor del Modal */}
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-100 transition-transform duration-300 ease-out"
        onClick={(e) => e.stopPropagation()} // Detener la propagación del clic para no cerrarse
      >
        
        {/* Header del Modal */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-xl font-semibold text-crucianelli-secondary">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition duration-150"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}