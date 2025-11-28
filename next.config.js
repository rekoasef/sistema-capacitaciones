/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración experimental aprobada para Server Actions y Supabase SSR
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
  },
  
  // La configuración de Webpack que causaba el error 'Cannot find module style-loader' ha sido eliminada.
  // Volvemos a depender del flujo estándar de Next.js.
};

module.exports = nextConfig;