import { signOut } from '@/lib/actions/auth.actions'; // Ruta relativa
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, LayoutDashboard, List, Users } from 'lucide-react'; // Añadimos iconos

// Componente para la barra de navegación del panel administrativo
export default function AdminNavbar() {
  return (
    <header className="bg-crucianelli-secondary shadow-lg border-b border-crucianelli-primary sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        
        {/* Logo y Nombre del Sistema */}
        <Link href="/admin/dashboard" className="flex items-center space-x-3">
          <Image
            src="/logo.png" 
            alt="Crucianelli Logo"
            width={100}
            height={30}
            className="object-contain filter invert opacity-80" 
          />
          <span className="text-sm font-bold text-white tracking-widest uppercase hidden sm:inline">
            Panel Admin
          </span>
        </Link>

        {/* Navegación Derecha (Enlaces de Módulos y Sign Out) */}
        <nav className="flex items-center space-x-4">
            
            <Link href="/admin/dashboard" className="text-gray-200 hover:text-white transition duration-150 text-sm font-medium flex items-center">
                <LayoutDashboard className="h-5 w-5 mr-1" /> Dashboard
            </Link>
            <Link href="/admin/capacitaciones" className="text-gray-200 hover:text-white transition duration-150 text-sm font-medium flex items-center">
                <List className="h-5 w-5 mr-1" /> Capacitaciones
            </Link>
            <Link href="/admin/concesionarios" className="text-gray-200 hover:text-white transition duration-150 text-sm font-medium flex items-center">
                <Users className="h-5 w-5 mr-1" /> Concesionarios
            </Link>

            {/* Formulario de Sign Out */}
            <form action={signOut}>
                <button
                type="submit"
                className="group flex items-center p-2 rounded-full text-white bg-red-600 hover:bg-red-700 transition duration-150 shadow-md"
                title="Cerrar Sesión"
                >
                <LogOut className="h-5 w-5" />
                <span className="sr-only sm:not-sr-only sm:ml-2 sm:text-sm">Cerrar Sesión</span>
                </button>
            </form>
        </nav>
      </div>
    </header>
  );
}