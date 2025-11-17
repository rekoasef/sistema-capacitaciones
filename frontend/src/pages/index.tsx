// frontend/src/pages/index.tsx

import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FiEye } from 'react-icons/fi';

// --- ¡AQUÍ ESTÁ EL CAMBIO! ---
// 1. Definimos la URL base de la API usando la variable de entorno.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

// --- Interfaces (se mantienen igual) ---
interface Capacitacion {
  id: number;
  nombre: string;
  descripcion: string;
  instructor: string;
  modalidad: string;
}
type PageProps = {
  capacitaciones: Capacitacion[];
};

export default function Home({ capacitaciones }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <header className="container mx-auto max-w-6xl mb-10 text-center">
        <Image 
          src="/logo.jpg"
          alt="Logo Crucianelli"
          width={300}
          height={60}
          className="mx-auto mb-6"
          fetchPriority="high"
          style={{ height: 'auto' }}
        />
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          Portal de Capacitaciones
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Inscríbete en nuestros próximos cursos y programas de formación.
        </p>
      </header>

      <div className="container mx-auto max-w-6xl">
        {capacitaciones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capacitaciones.map((cap) => (
              <div 
                key={cap.id} 
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{cap.nombre}</h2>
                  <p className="text-sm text-gray-500 mt-1">Instructor: {cap.instructor}</p>
                  <p className="text-sm text-gray-700 mt-3 line-clamp-3">{cap.descripcion}</p>
                </div>
                <div className="mt-6">
                  <Link 
                    href={`/capacitaciones/${cap.id}`} 
                    className="w-full text-center bg-[#D80027] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#b80021] transition-colors inline-flex items-center justify-center"
                  >
                    <FiEye className="mr-2" />
                    Ver Detalles e Inscripción
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-10 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700">No hay capacitaciones publicadas</h2>
            <p className="text-gray-500 mt-2">Por favor, vuelve a consultar más tarde.</p>
          </div>
        )}
      </div>
    </main>
  );
}

// --- getServerSideProps (MODIFICADO) ---
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  // Evitar caché para que los datos sean siempre frescos
  context.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  
  try {
    // 2. Usamos la variable API_BASE_URL
    const res = await fetch(`${API_BASE_URL}/capacitaciones`);
    if (!res.ok) {
      throw new Error('No se pudo conectar a la API.');
    }
    const capacitaciones: Capacitacion[] = await res.json();
    return { props: { capacitaciones } };
  } catch (error) {
    console.error('Error fetching capacitaciones:', error);
    // Devolvemos un array vacío si la API falla, para que la página no se rompa
    return { props: { capacitaciones: [] } };
  }
};