import Link from 'next/link';
import Image from 'next/image';

// Navbar con efecto Glassmorphism (Blur)
export default function Navbar() {
  return (
    // Agregamos 'bg-white/80' (transparencia) y 'backdrop-blur-md' (desenfoque)
    // Aumentamos el z-index a 50 para asegurar que flote sobre todo
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        
        {/* Logo y Branding de Crucianelli */}
        <Link href="/" className="flex items-center space-x-3 group">
          <Image
            src="/logo.png" 
            alt="Crucianelli Logo"
            width={120} 
            height={40} 
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            priority 
          />
          <span className="sr-only">Crucianelli Home</span>
        </Link>

        {/* Navegación Derecha (Enlaces y Login) */}
        {/* <nav className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-crucianelli-primary transition-colors text-sm font-medium"
          >
            Portal Público
          </Link>
          <Link 
            href="/admin/login" 
            className="px-4 py-2 text-sm font-medium text-white bg-crucianelli-secondary rounded-lg shadow-md hover:bg-crucianelli-primary transition-all transform hover:-translate-y-0.5"
          >
            Panel Admin
          </Link>
        </nav> */}
      </div>
    </header>
  );
}