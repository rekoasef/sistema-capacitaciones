// FIX CRÍTICO: Usar ruta relativa para archivos CSS dentro de la misma carpeta /app.
import './globals.css'; 
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Metadatos base para SEO y branding
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
        {/* Contenedor principal para toda la aplicación */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}