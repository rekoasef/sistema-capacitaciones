// frontend/src/pages/admin/login.tsx

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import toast from 'react-hot-toast';

// --- ¡AQUÍ ESTÁ EL CAMBIO! ---
// 1. Definimos la URL base de la API usando la variable de entorno.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- handleSubmit (MODIFICADO) ---
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const toastId = toast.loading('Iniciando sesión...');

    try {
      // 2. Usamos la variable API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error de autenticación');
      }
      localStorage.setItem('token', data.access_token);
      toast.success('¡Bienvenido!', { id: toastId });
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-xl">
        <div className="flex justify-center">
          {/* Ya corregimos fetchPriority y style en la Fase 13.1.1 */}
          <Image
            src="/logo.jpg"
            alt="Logo Crucianelli"
            width={250}
            height={50}
            className="mb-8"
            fetchPriority="high" 
            style={{ height: 'auto' }} 
          />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Panel de Administración
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#D80027] hover:bg-[#b80021] disabled:bg-gray-400"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
          {error && <div className="p-4 rounded-lg bg-red-100 text-red-800 text-center">{error}</div>}
        </form>
      </div>
    </main>
  );
}