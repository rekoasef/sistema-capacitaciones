import { createClient } from '@/lib/supabase/server'; // Ruta relativa
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminNavbar from '@/components/ui/AdminNavbar'; // Importado para el FIX de arquitectura

// Este es un Server Component que se encarga de mostrar la información principal
export default async function AdminDashboardPage() {
  // Obtenemos el cliente Supabase del lado del servidor
  const supabase = createClient();
  
  // Nivel de Seguridad 1: Verificar la sesión (Aunque el middleware lo hace, es una buena práctica aquí)
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/admin/login');
  }

  // Obtenemos el email del usuario para el saludo en el dashboard
  const userEmail = session.user.email;

  return (
    <>
      {/* FIX ARQUITECTÓNICO: Se incluye el AdminNavbar aquí para que no aparezca
        en el /admin/login (ya que fue eliminado del /admin/layout.tsx).
      */}
      <AdminNavbar />

      {/* Contenedor principal del Dashboard */}
      <div className="p-6 bg-white rounded-xl shadow-lg mt-4"> 
        <h1 className="text-3xl font-bold text-crucianelli-secondary mb-6">
          Bienvenido al Dashboard, {userEmail}!
        </h1>
        
        <p className="text-gray-700 mb-4">
          Este es el panel central de control del sistema de capacitaciones Crucianelli.
        </p>

        {/* Módulos principales del sistema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          
          {/* Tarjeta 1: Capacitaciones */}
          <Link href="/admin/capacitaciones" className="group block">
              <div className="bg-crucianelli-primary text-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 transform group-hover:scale-[1.02]">
                  <h2 className="text-xl font-semibold mb-2">Capacitaciones</h2>
                  <p>Gestionar cursos, fechas y contenido.</p>
              </div>
          </Link>
          
          {/* Tarjeta 2: Inscripciones (PENDIENTE) */}
          <Link href="/admin/inscripciones" className="group block">
              <div className="bg-crucianelli-secondary text-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 transform group-hover:scale-[1.02]">
                  <h2 className="text-xl font-semibold mb-2">Inscripciones</h2>
                  <p>Revisar y gestionar los registros de usuarios.</p>
              </div>
          </Link>
          
          {/* Tarjeta 3: Concesionarios */}
          <Link href="/admin/concesionarios" className="group block">
              <div className="bg-gray-700 text-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 transform group-hover:scale-[1.02]">
                  <h2 className="text-xl font-semibold mb-2">Concesionarios</h2>
                  <p>Administrar la lista de concesionarios autorizados.</p>
              </div>
          </Link>
        </div>
      </div>
    </>
  );
}