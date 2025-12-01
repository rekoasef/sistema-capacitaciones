import { signOut } from '@/lib/actions/auth.actions'; 
import Image from 'next/image';
import Link from 'next/link';
// Agregamos ClipboardList a los imports
import { LogOut, LayoutDashboard, List, Users, ClipboardList } from 'lucide-react'; 

export default function AdminNavbar() {
  return (
    <header className="bg-crucianelli-secondary shadow-lg border-b border-crucianelli-primary sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        
        {/* Logo y Branding */}
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

        {/* Navegación Principal */}
        <nav className="flex items-center space-x-4">
            
            <Link href="/admin/dashboard" className="text-gray-200 hover:text-white transition duration-150 text-sm font-medium flex items-center">
                <LayoutDashboard className="h-5 w-5 mr-1" /> 
                <span className="hidden md:inline">Dashboard</span>
            </Link>
            
            <Link href="/admin/capacitaciones" className="text-gray-200 hover:text-white transition duration-150 text-sm font-medium flex items-center">
                <List className="h-5 w-5 mr-1" /> 
                <span className="hidden md:inline">Capacitaciones</span>
            </Link>

            {/* NUEVO ENLACE: Inscripciones */}
            <Link href="/admin/inscripciones" className="text-gray-200 hover:text-white transition duration-150 text-sm font-medium flex items-center">
                <ClipboardList className="h-5 w-5 mr-1" /> 
                <span className="hidden md:inline">Inscripciones</span>
            </Link>
            
            <Link href="/admin/concesionarios" className="text-gray-200 hover:text-white transition duration-150 text-sm font-medium flex items-center">
                <Users className="h-5 w-5 mr-1" /> 
                <span className="hidden md:inline">Concesionarios</span>
            </Link>

            {/* Separador Vertical */}
            <div className="h-6 w-px bg-gray-600 mx-2 hidden sm:block"></div>

            {/* Botón Cerrar Sesión */}
            <form action={signOut}>
                <button
                    type="submit"
                    className="group flex items-center p-2 rounded-full text-white bg-red-600 hover:bg-red-700 transition duration-150 shadow-md"
                    title="Cerrar Sesión"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Cerrar Sesión</span>
                </button>
            </form>
        </nav>
      </div>
    </header>
  );
}