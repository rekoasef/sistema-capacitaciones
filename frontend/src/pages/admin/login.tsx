// frontend/src/pages/admin/login.tsx

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import nookies from 'nookies'; // <-- 1. Importamos nookies

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión.');
      }

      if (data.access_token) {
        // Guardamos en localStorage (útil para lógica del lado del cliente)
        localStorage.setItem('token', data.access_token);
        
        // --- ¡AÑADIDO! Guardamos el token en una cookie HttpOnly segura ---
        nookies.set(null, // null significa que se ejecuta en el lado del cliente
          'token', // Nombre de la cookie
          data.access_token, // Valor de la cookie
          {
             maxAge: 30 * 24 * 60 * 60, // Tiempo de vida en segundos (30 días)
             path: '/', // La cookie estará disponible en todo el sitio
             // Opciones de seguridad importantes (descomentar en producción):
             // httpOnly: true, // ¡CRUCIAL! Impide que JS acceda a la cookie (protege XSS)
             // secure: process.env.NODE_ENV === 'production', // Solo enviar por HTTPS
             // sameSite: 'strict', // Protección contra ataques CSRF
          }
        );
        
        router.push('/admin/dashboard'); 
      }

    } catch (err: any) {
      setError(err.message || 'Error de conexión. Asegúrate de que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  // --- El JSX se mantiene igual que antes ---
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        
        <div className="flex justify-center">
          <Image 
              src="/logo.jpg" // Asume logo.jpg en /public
              alt="Logo Crucianelli"
              width={250}
              height={50}
              priority
          />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Acceso de Administrador</h1>
          <p className="mt-2 text-gray-600">Ingresa tus credenciales para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              id="password" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm"
              placeholder="********"
            />
          </div>

          <div>
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#D80027] hover:bg-[#b80021] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D80027] disabled:bg-gray-400"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>

          {error && (
            <div className="p-4 text-center rounded-lg bg-red-100 text-red-800">
              {error}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}