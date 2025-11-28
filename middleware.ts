import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

// Lista de rutas que requieren autenticación para acceder (panel admin)
const protectedRoutes = [
    '/admin',
    '/admin/dashboard',
    '/admin/capacitaciones',
    '/admin/concesionarios',
    // ... futuras rutas
];

// Rutas de autenticación (login, etc.)
const authRoutes = ['/admin/login'];

export async function middleware(request: NextRequest) {
  try {
    // 1. Crear el cliente de Supabase usando el middleware helper
    const { supabase, response } = createClient(request);
    
    // 2. Obtener la sesión del usuario (lee las cookies)
    const { data: { session } } = await supabase.auth.getSession();

    const pathname = request.nextUrl.pathname;

    // A. Si el usuario intenta acceder a una ruta protegida sin sesión
    if (protectedRoutes.some(route => pathname.startsWith(route)) && !session) {
      // Redirigir al login
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    
    // B. Si el usuario tiene sesión e intenta acceder a la página de login
    if (authRoutes.includes(pathname) && session) {
      // Redirigir al dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }

    // 3. Retornar la respuesta (incluyendo cookies actualizadas)
    return response;

  } catch (e) {
    // Esto es un error interno. Puede ocurrir si el cliente de Supabase no se inicializa correctamente.
    console.error("Middleware error:", e);
    return NextResponse.next({
        request: {
            headers: request.headers,
        },
    });
  }
}

// Configuración del matcher para que el middleware solo se ejecute en las rutas relevantes
export const config = {
  matcher: [
    /*
     * Excluir archivos, APIs de Next.js, _next/static, _next/image, favicons, etc.
     * Incluir solo las rutas del portal público (/) y el admin (/admin/*)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|logo.png|manifest.json).*)',
  ],
}