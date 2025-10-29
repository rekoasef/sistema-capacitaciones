// frontend/src/pages/_app.tsx

import '@/styles/globals.css';
import '@/styles/nprogress.css'; 
import type { AppProps } from 'next/app';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast'; // <-- 1. Importamos el Toaster

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  
  if (router.pathname.startsWith('/admin/') && router.pathname !== '/admin/login') {
    return (
      <AdminLayout>
        {/* 2. Añadimos el Toaster aquí */}
        <Toaster position="top-right" />
        <Component {...pageProps} />
      </AdminLayout>
    );
  }

  // 3. Añadimos el Toaster también para las páginas públicas
  return (
    <>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </>
  );
}