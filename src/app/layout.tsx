import './globals.css'; 
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// Importamos NUESTRO componente cliente, no la librería directa
import { ToasterClient } from '@/components/ui/ToasterClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Crucianelli - Sistema de Gestión de Capacitaciones',
  description: 'Plataforma administrativa y de inscripción para capacitaciones de Crucianelli.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
        {/* Usamos el wrapper cliente */}
        <ToasterClient />
      </body>
    </html>
  );
}