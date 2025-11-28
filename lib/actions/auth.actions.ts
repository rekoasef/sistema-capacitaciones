'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ====================================================================
// Acción de Iniciar Sesión (Sign-In)
// Nota: Solo usa email/password. El registro de nuevos admins 
// debe hacerse manualmente por un SuperAdmin en Supabase Auth por seguridad.
// ====================================================================
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Retornamos el error para mostrar un mensaje amigable en el formulario de login.
    console.error('Error al iniciar sesión:', error.message);
    return { 
      success: false, 
      message: 'Credenciales inválidas o cuenta no autorizada. Inténtalo de nuevo.' 
    };
  }

  // Redirigir al dashboard después de un inicio de sesión exitoso.
  revalidatePath('/admin/dashboard', 'layout');
  redirect('/admin/dashboard');
}

// ====================================================================
// Acción de Cerrar Sesión (Sign-Out)
// ====================================================================
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();

  // Redirigir al login después de cerrar la sesión.
  revalidatePath('/', 'layout');
  redirect('/admin/login');
}