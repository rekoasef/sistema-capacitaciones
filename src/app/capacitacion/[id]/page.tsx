import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, BookOpen, CalendarDays } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
// Este componente lo crearemos en el siguiente paso
import PublicGroupList from '@/components/public/PublicGroupList'; 
import { getCapacitacionPublicaById } from '@/lib/services/capacitacion.service';
import { getGruposPublicos } from '@/lib/services/grupo.service';

interface PageProps {
  params: {
    id: string;
  };
}

// Forzamos dinamismo para que siempre muestre cupos reales al instante
export const dynamic = 'force-dynamic';

export default async function CapacitacionDetallePage({ params }: PageProps) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  // 1. Obtención de datos en paralelo (Eficiencia)
  const [capacitacion, grupos] = await Promise.all([
    getCapacitacionPublicaById(id),
    getGruposPublicos(id)
  ]);

  // Si no existe o no es visible (seguridad), 404
  if (!capacitacion) {
    notFound();
  }

  // Helper visual para icono de modalidad
  const getModalidadIcon = (mod: string) => {
    switch (mod) {
        case 'online': return <BookOpen className="w-5 h-5 mr-2" />;
        case 'presencial': return <MapPin className="w-5 h-5 mr-2" />;
        default: return <CalendarDays className="w-5 h-5 mr-2" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* Botón Volver */}
        <div className="mb-6">
            <Link 
                href="/" 
                className="inline-flex items-center text-gray-500 hover:text-crucianelli-secondary transition-colors text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver al listado
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMNA IZQUIERDA: Información del Curso */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Encabezado del Curso */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 capitalize">
                            {getModalidadIcon(capacitacion.modalidad)}
                            Modalidad {capacitacion.modalidad}
                        </span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                        {capacitacion.nombre}
                    </h1>

                    <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Acerca de esta capacitación</h3>
                        <p className="whitespace-pre-line">
                            {capacitacion.descripcion}
                        </p>
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA: Oferta de Grupos (Sidebar Sticky) */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                    
                    {/* Tarjeta de Selección de Fechas */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h3 className="text-xl font-bold text-crucianelli-secondary mb-1">
                            Inscripción Abierta
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Selecciona una fecha disponible para reservar tu lugar.
                        </p>

                        {/* Lista de Grupos Disponibles */}
                        <PublicGroupList grupos={grupos} />
                    </div>

                    {/* Caja de Ayuda / Contacto */}
                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 text-center">
                        <p className="text-sm text-blue-800 font-medium">
                            ¿Tienes dudas sobre el contenido?
                        </p>
                        <a href="mailto:capacitacion@crucianelli.com" className="text-sm text-blue-600 hover:underline mt-1 block">
                            Contactar al instructor
                        </a>
                    </div>

                </div>
            </div>

        </div>
      </main>

      {/* Footer Simple */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Crucianelli S.A.</p>
        </div>
      </footer>
    </div>
  );
}