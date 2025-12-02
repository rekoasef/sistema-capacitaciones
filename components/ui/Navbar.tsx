import Link from 'next/link';
import Image from 'next/image';

// Navbar simple, Server Component
export default function Navbar() {
  return (
    <header className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        
        {/* Logo y Branding de Crucianelli */}
        <Link href="/" className="flex items-center space-x-3">
          {/* Se asume que logo.png está en el directorio /public */}
          <Image
            src="/logo.png" 
            alt="Crucianelli Logo"
            width={120} // Ajustar el ancho según el diseño del logo
            height={40} // Ajustar la altura para mantener la proporción
            className="object-contain"
            priority // Carga prioritaria para el logo
          />
          <span className="sr-only">Crucianelli Home</span>
        </Link>

        {/* Navegación Derecha (Enlaces y Login) */}
        {/* <nav className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-primary transition duration-150 text-sm font-medium"
          >
            Portal Público
          </Link>
          <Link 
            href="/admin/login" 
            className="px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-blue-600 transition duration-150"
          >
            Panel Admin
          </Link>
        </nav> */}
      </div>
    </header>
  );
}