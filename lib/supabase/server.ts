// Este cliente se usa exclusivamente en Server Components y Route Handlers (API Routes).
// Es seguro porque lee y escribe cookies httpOnly, manteniendo la sesión protegida en el servidor.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase'; // Tipo generado

// Función para obtener un cliente de Supabase para el servidor
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Error: No se puede configurar cookies desde Server Components no en Route Handler.
            // Esto sucede si se intenta llamar a esta función en un componente de servidor que no es una ruta API o una página.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Error: No se puede configurar cookies
          }
        },
      },
    }
  )
}
// NOTA: En Server Components, solo se requiere la clave pública porque el RLS 
// valida el JWT de la sesión, no la clave privada del servicio.