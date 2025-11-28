// Este cliente se usa en Client Components para llamadas del lado del navegador.
// Es seguro porque utiliza la clave pública anónima y maneja la sesión automáticamente via localStorage/cookies.

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase'; // Usaremos un tipo generado en la Fase 1.2

// Función para obtener un cliente de Supabase para el navegador
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
// NOTA: El tipo <Database> será generado automáticamente por la CLI de Supabase
// una vez que definamos el esquema en la Fase 1.2.