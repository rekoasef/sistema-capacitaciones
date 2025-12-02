import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-crucianelli-secondary text-gray-300 text-sm animate-fade-in">
      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Columna 1: Marca y Sobre Nosotros */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
             {/* Usamos un filtro para volver blanco el logo si es necesario, o idealmente usar una versión blanca */}
             <div className="brightness-0 invert">
                <Image src="/logo.png" alt="Crucianelli" width={120} height={40} className="h-10 w-auto object-contain" />
             </div>
          </div>
          <p className="leading-relaxed text-gray-400 max-w-xs">
            Líderes en innovación agrícola. Capacitamos a nuestra red para brindar el mejor servicio posventa del país.
          </p>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-wider mb-4">Navegación</h3>
          <ul className="space-y-2.5">
            <li>
              <Link href="/" className="hover:text-crucianelli-primary transition-colors">
                Inicio y Cursos
              </Link>
            </li>
            <li>
              <a href="https://www.crucianelli.com/" target="_blank" rel="noopener noreferrer" className="hover:text-crucianelli-primary transition-colors flex items-center gap-1">
                Sitio Web Oficial <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li className="pt-2">
                {/* Boton para ingresar al portal del administrador */}
              {/* <Link href="/admin/login" className="inline-block bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md transition-colors text-xs font-medium">
                Acceso Administrativo
              </Link> */}
            </li>
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-wider mb-4">Contacto</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-crucianelli-primary flex-shrink-0 mt-0.5" />
              <span>Ruta Nac. N° 9 Km 397<br />Armstrong, Santa Fe, Argentina</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-crucianelli-primary flex-shrink-0" />
              <span>+54 3471 491000</span>
            </li>
            <li className="flex items-center gap-3">
               <Mail className="w-5 h-5 text-crucianelli-primary flex-shrink-0" />
               <span>capacitacion@crucianelli.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Barra Inferior Copyright */}
      <div className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {currentYear} Talleres Metalúrgicos Crucianelli S.A. Todos los derechos reservados.</p>
          <p>Desarrollado para la red de concesionarios.</p>
        </div>
      </div>
    </footer>
  );
}