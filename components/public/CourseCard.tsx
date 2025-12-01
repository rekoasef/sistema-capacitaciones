import Link from 'next/link';
import { CalendarDays, MapPin, ArrowRight, BookOpen } from 'lucide-react';
import { CapacitacionRow } from '@/types/capacitacion.types';

interface CourseCardProps {
  capacitacion: CapacitacionRow;
}

export default function CourseCard({ capacitacion }: CourseCardProps) {
  // Helper para truncar la descripción si es muy larga
  const truncateDescription = (text: string | null, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Helper para iconos de modalidad
  const getModalidadIcon = (modalidad: string) => {
    switch (modalidad) {
      case 'online': return <BookOpen className="w-4 h-4 mr-1" />;
      case 'presencial': return <MapPin className="w-4 h-4 mr-1" />;
      case 'hibrido': return <CalendarDays className="w-4 h-4 mr-1" />;
      default: return <BookOpen className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full group">
      
      {/* Header Visual (Franja de color o Imagen Placeholder) */}
      <div className="h-3 bg-crucianelli-primary w-full group-hover:h-4 transition-all duration-300"></div>
      
      <div className="p-6 flex flex-col flex-grow">
        
        {/* Badges / Metadatos Superiores */}
        <div className="flex justify-between items-start mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 capitalize">
            {getModalidadIcon(capacitacion.modalidad)}
            {capacitacion.modalidad}
          </span>
          {/* Aquí podríamos poner "Cupos disponibles" en el futuro */}
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-crucianelli-secondary transition-colors">
          {capacitacion.nombre}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-6 flex-grow">
          {truncateDescription(capacitacion.descripcion)}
        </p>

        {/* Footer / Botón de Acción */}
        <div className="mt-auto pt-4 border-t border-gray-50">
          <Link 
            href={`/capacitacion/${capacitacion.id}`} 
            className="inline-flex items-center text-crucianelli-secondary font-semibold text-sm hover:text-crucianelli-primary transition-colors"
          >
            Ver detalles e inscribirme
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}