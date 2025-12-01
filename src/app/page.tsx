import Link from 'next/link';
import { Search, GraduationCap } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import CourseCard from '@/components/public/CourseCard';
import { getCapacitacionesPublicas } from '@/lib/services/capacitacion.service';

// Forzamos que esta página sea dinámica para que refleje cambios al instante (o usamos revalidate)
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 1. Obtener datos filtrados (solo visibles)
  const capacitaciones = await getCapacitacionesPublicas();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Barra de Navegación Pública */}
      <Navbar />

      {/* --- HERO SECTION (Banner Principal) --- */}
      <section className="bg-crucianelli-secondary text-white py-16 md:py-24 relative overflow-hidden">
        {/* Elemento decorativo de fondo */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Portal de Capacitación <span className="text-crucianelli-primary">Crucianelli</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
            Potencia tus habilidades y conoce a fondo nuestra tecnología. 
            Inscríbete en los cursos disponibles para concesionarios y clientes.
          </p>
          
          <div className="flex justify-center">
            <Link 
              href="#cursos" 
              className="px-8 py-3 bg-crucianelli-primary hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              Explorar Cursos
            </Link>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN DE CURSOS --- */}
      <main id="cursos" className="container mx-auto px-4 py-16 flex-grow">
        
        <div className="flex items-center justify-between mb-10 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <GraduationCap className="mr-2 text-crucianelli-secondary" />
            Cursos Disponibles
          </h2>
          <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full border shadow-sm">
            {capacitaciones.length} resultados
          </span>
        </div>

        {/* Grilla de Resultados */}
        {capacitaciones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capacitaciones.map((cap) => (
              <CourseCard key={cap.id} capacitacion={cap} />
            ))}
          </div>
        ) : (
          // Estado Vacío (Empty State)
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No hay capacitaciones visibles</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Actualmente no tenemos cursos abiertos al público. 
              Por favor, vuelve a consultar más tarde.
            </p>
          </div>
        )}
      </main>

      {/* Footer Simple */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Crucianelli S.A. - Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}