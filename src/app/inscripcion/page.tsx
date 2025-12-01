import { redirect } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import InscripcionForm from '@/components/public/InscripcionForm';
import { getConcesionariosPublicos } from '@/lib/services/concesionario.service';

interface PageProps {
  // En Next.js App Router, los query params (?grupo=1) vienen en searchParams
  searchParams: { [key: string]: string | string[] | undefined };
}

// Forzamos dinamismo para evitar cacheo estático de query params
export const dynamic = 'force-dynamic';

export default async function InscripcionPage({ searchParams }: PageProps) {
  // 1. Obtener y Validar ID del Grupo
  const grupoParam = searchParams['grupo'];
  const grupoId = typeof grupoParam === 'string' ? parseInt(grupoParam) : 0;

  // Validación de seguridad: Si no hay ID válido, redirigir a la Home
  // para que el usuario inicie el flujo correctamente.
  if (!grupoId || isNaN(grupoId)) {
    redirect('/');
  }

  // 2. Obtener datos auxiliares (Concesionarios)
  const concesionarios = await getConcesionariosPublicos();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        
        {/* Contenedor del Formulario */}
        <div className="w-full max-w-lg">
          {/* Mensaje de contexto opcional */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Finaliza tu Inscripción
            </h1>
            <p className="text-gray-500 mt-2">
              Completa tus datos para reservar tu lugar en la capacitación.
            </p>
          </div>

          {/* Componente de Formulario (Cliente) */}
          <InscripcionForm 
            grupoId={grupoId} 
            concesionarios={concesionarios} 
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Crucianelli S.A. - Portal de Capacitación</p>
        </div>
      </footer>
    </div>
  );
}