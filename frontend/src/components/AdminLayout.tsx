// frontend/src/components/AdminLayout.tsx

import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';
import { FiGrid, FiFileText, FiUsers, FiLogOut, FiBriefcase } from 'react-icons/fi';
import Image from 'next/image';

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
    { href: '/admin/capacitaciones', label: 'Capacitaciones', icon: FiFileText },
    { href: '/admin/inscriptos', label: 'Inscriptos', icon: FiUsers },
    { href: '/admin/concesionarios', label: 'Concesionarios', icon: FiBriefcase },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
      <aside className="w-64 bg-white shadow-lg flex flex-col flex-shrink-0 border-r border-gray-200">
        
        <div className="p-4 h-[90px] flex justify-center items-center border-b">
          {/* --- ¡CÓDIGO CORREGIDO! --- */}
          <Image 
              src="/logo.jpg"
              alt="Logo Crucianelli"
              width={180}
              height={36}
              fetchPriority="high" // Corregido de 'priority'
              style={{ height: 'auto' }} // Añadido para mantener el ratio
          />
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = router.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-3 text-lg rounded-lg transition-all duration-200 ease-in-out ${
                  isActive
                    ? 'bg-[#D80027] text-white font-semibold shadow-sm'
                    : 'text-gray-700 font-medium hover:bg-red-50 hover:text-[#D80027] hover:translate-x-1'
                }`}
              >
                <link.icon className="mr-3" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-lg text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <FiLogOut className="mr-3 text-gray-500" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}