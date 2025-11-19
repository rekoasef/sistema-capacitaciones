// frontend/src/hooks/useApi.ts

import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

// --- CORREGIDO: La URL base debe ser 3001. ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'; // Puerto 3001

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: object | string;
};

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const request = useCallback(
    async <T>(endpoint: string, options: ApiOptions = {}): Promise<T | null> => {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = new Headers(options.headers || {});

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      let body: string | undefined;
      if (options.body) {
        if (typeof options.body === 'object' && !(options.body instanceof FormData)) {
          if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
          }
          body = JSON.stringify(options.body);
        } else {
          body = options.body as string;
        }
      }

      try {
        // CORRECCIÓN: Añadimos el prefijo /api que el backend (NestJS) requiere
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
          ...options,
          headers,
          body,
        });

        if (response.status === 401) {
          toast.error('Tu sesión ha expirado. Por favor, ingresa de nuevo.');
          localStorage.removeItem('token');
          router.push('/admin/login');
          throw new Error('Sesión expirada');
        }
        
        if (response.status === 204) {
          setLoading(false);
          return null; 
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Ocurrió un error en la solicitud.');
        }
        
        return data as T;

      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return { request, loading, error };
}