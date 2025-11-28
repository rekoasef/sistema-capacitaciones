'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import Image from 'next/image';
import { LogIn, User, Lock } from 'lucide-react';
import { signIn } from '../../../../lib/actions/auth.actions';
import { useState } from 'react';

// Definición de tipos para el formulario
type LoginFormInputs = {
  email: string;
  password: string;
};

// Página de Login (Client Component)
export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Acción que se ejecuta al enviar el formulario
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setErrorMessage(null); // Limpiar errores anteriores
    
    // Convertimos los datos a un FormData, ya que el Server Action espera ese tipo
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await signIn(formData);
    
    if (result && !result.success) {
      // Si el Server Action retorna un error (credenciales inválidas)
      setErrorMessage(result.message);
    }
    // Si es exitoso, el Server Action maneja la redirección a /admin/dashboard
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-10 transition-all duration-300">
        
        {/* Encabezado y Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png" 
            alt="Crucianelli Logo"
            width={150}
            height={45}
            className="object-contain mb-4" 
            priority
          />
          <h1 className="text-3xl font-extrabold text-crucianelli-secondary tracking-tight">
            Acceso Administrativo
          </h1>
          <p className="text-sm text-gray-500 mt-2">Sistema de Capacitaciones Crucianelli</p>
        </div>

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                disabled={isSubmitting}
                {...register('email', { required: 'El email es obligatorio' })}
                className={`w-full appearance-none rounded-lg border px-10 py-3 text-gray-900 placeholder-gray-400 focus:z-10 focus:outline-none transition duration-150 ${
                  errors.email ? 'border-red-500' : 'border-gray-300 focus:border-crucianelli-primary focus:ring-crucianelli-primary'
                }`}
                placeholder="usuario@crucianelli.com"
              />
            </div>
            {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          {/* Campo Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                {...register('password', { required: 'La contraseña es obligatoria' })}
                className={`w-full appearance-none rounded-lg border px-10 py-3 text-gray-900 placeholder-gray-400 focus:z-10 focus:outline-none transition duration-150 ${
                  errors.password ? 'border-red-500' : 'border-gray-300 focus:border-crucianelli-primary focus:ring-crucianelli-primary'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          {/* Mensaje de Error (del Server Action) */}
          {errorMessage && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg text-center font-medium">
              {errorMessage}
            </div>
          )}

          {/* Botón de Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white transition duration-200 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-crucianelli-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crucianelli-primary'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando Sesión...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">Panel exclusivo para administración y gestión.</p>
        </div>
      </div>
    </div>
  );
}