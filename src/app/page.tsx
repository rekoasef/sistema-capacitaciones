import Link from 'next/link';
import { CalendarDays, MapPin, Users, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import CourseCard from '@/components/public/CourseCard';
import { getCapacitacionesPublicas } from '@/lib/services/capacitacion.service';
// 1. Importamos el Footer
import Footer from '@/components/ui/Footer';

// Forzamos dinamismo para que siempre muestre los cursos actualizados
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Fetch de datos (Server Side)
  const cursos = await getCapacitacionesPublicas();

  return (
    // 2. Cambiamos la estructura a Flex Column para manejar el footer
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      {/* 3. Envolvemos el contenido principal en un div con flex-grow */}
      <div className="flex-grow">
        
        {/* Hero Section */}
        <section className="relative bg-crucianelli-primary overflow-hidden">
          {/* ... (Patrón de fondo opcional) ... */}
          <div className="absolute inset-0 opacity-10 pattern-dots pattern-crucianelli-secondary pattern-bg-transparent pattern-size-4 pattern-opacity-100"></div>
          
          <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
            <div className="max-w-3xl mx-auto text-center text-white space-y-6 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium border border-white/20 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                    <span>Portal Oficial de Capacitación Técnica</span>
                </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Potencia tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">Conocimiento</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto">
                Plataforma exclusiva para la formación continua de mecánicos y técnicos de la red de concesionarios Crucianelli.
              </p>
            </div>
          </div>
          
          {/* Wave Divider (Decoración inferior) */}
          <div className="absolute bottom-0 left-0 right-0">
              <svg className="fill-gray-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
                  <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
              </svg>
          </div>
        </section>

        {/* Courses Section */}
        <section className="py-16 container mx-auto px-4 relative z-10" id="cursos">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-8 h-8 text-crucianelli-primary" />
                      Próximas Capacitaciones
                  </h2>
                  <p className="text-gray-600 mt-2 text-lg">Inscríbete en los cursos disponibles para tu equipo.</p>
                </div>
            </div>

          {cursos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cursos.map((curso) => (
                // CORRECCIÓN AQUÍ: Prop 'capacitacion' en lugar de 'curso'
                <CourseCard key={curso.id} capacitacion={curso} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
              <CalendarDays className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay cursos disponibles por el momento</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Estamos planificando nuevas fechas. Vuelve a consultar pronto o contacta a administración.
              </p>
            </div>
          )}
        </section>
      </div>
      
      {/* 4. Agregamos el Footer al final */}
      <Footer />
    </main>
  );
}