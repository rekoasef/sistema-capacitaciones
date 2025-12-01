import { redirect } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import AdminNavbar from '@/components/ui/AdminNavbar';
import { createClient } from '@/lib/supabase/server';
import { getDashboardStats } from '@/lib/services/dashboard.service';
// Este componente lo crearemos en el siguiente paso
import DashboardStats from '@/components/admin/dashboard/DashboardStats';

// Forzamos dinamismo para ver métricas en tiempo real al entrar
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = createClient();
  
  // 1. Verificación de Sesión
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/admin/login');
  }

  // 2. Obtención de Métricas (Backend)
  const stats = await getDashboardStats();
  const userEmail = session.user.email;

  return (
    <>
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-[calc(100vh-64px)]">
        
        {/* Encabezado del Dashboard */}
        <div className="flex items-center mb-8">
            <div className="p-3 bg-white border border-gray-200 rounded-lg mr-4 shadow-sm">
                <LayoutDashboard className="w-8 h-8 text-crucianelli-secondary" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
                <p className="text-gray-500 text-sm">
                    Sesión activa como: <span className="font-medium text-crucianelli-primary">{userEmail}</span>
                </p>
            </div>
        </div>

        {/* 3. Renderizado de la Vista de Métricas */}
        {/* Pasamos los datos calculados al componente visual */}
        <DashboardStats stats={stats} />
        
      </div>
    </>
  );
}