import { createClient } from '@/lib/supabase/server';
// Ya no necesitamos importar 'Database' ni los tipos de la fila aquí, 
// ya que la lógica se delega a la función SQL.

/**
 * Verifica si el usuario autenticado actualmente tiene el rol 'SuperAdmin' 
 * mediante una llamada a la función SQL 'is_super_admin()'.
 * Esto es más robusto y evita problemas de lectura de RLS/JOINs en Server Components.
 * @returns {Promise<boolean>} True si es SuperAdmin, False en caso contrario.
 */
export async function isSuperAdmin(): Promise<boolean> {
    const supabase = createClient();
    
    // 1. Obtener la sesión del usuario (para logging y para asegurar que hay un usuario activo)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        // Log para saber si el usuario no está logueado en absoluto
        console.error("DEBUG AUTH: No hay sesión activa o error en la sesión.", sessionError?.message);
        return false;
    }
    
    // 2. LOG CRÍTICO: Registramos el UUID que se está usando para la verificación
    console.log(`DEBUG AUTH: Sesión activa encontrada. User ID (UUID) a verificar: ${session.user.id}`);
    
    // 3. Llamada RPC a la función SQL 'is_super_admin()'
    try {
        // La función SQL se ejecuta con el contexto del JWT del usuario.
        const { data: isSA, error: rpcError } = await supabase
            .rpc('is_super_admin'); // <-- Llamada al procedimiento remoto
        
        if (rpcError) {
            // Log de error específico de la BD
            console.error(`DEBUG RPC: Error en la llamada SQL 'is_super_admin' para ${session.user.email}:`, rpcError.message);
            return false;
        }

        // El resultado de la función SQL es un booleano
        const result = isSA as boolean;

        // Log final (debería ser TRUE si todo funciona)
        console.log(`DEBUG AUTH: Resultado final de rol (isSuperAdmin): ${result}`);
        
        return result;

    } catch (e) {
        console.error("DEBUG CRITICAL ERROR: Fallo de conexión o inesperado durante RPC:", e);
        return false;
    }
}