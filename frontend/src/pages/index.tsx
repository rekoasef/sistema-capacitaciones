// frontend/src/pages/index.tsx

import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link'; // Importamos Link para la navegación

// --- Las interfaces se mantienen igual ---
interface Capacitacion {
  id: number;
  nombre: string;
  descripcion: string;
  instructor: string;
}

// Ya no necesitamos los grupos en esta página, solo las capacitaciones
type PageProps = {
  capacitaciones: Capacitacion[];
};

export default function Home({ capacitaciones }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto px-4 py-12">
        {/* --- Encabezado de la Página --- */}
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image 
                src="/logo.jpg"
                alt="Logo Crucianelli"
                width={280}
                height={60}
                priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Capacitaciones Disponibles</h1>
          <p className="mt-4 text-lg text-gray-600">Explora nuestra oferta de cursos y regístrate en el que más te interese.</p>
        </header>

        {/* --- Galería de Tarjetas (Cards) --- */}
        {capacitaciones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capacitaciones.map((cap) => (
              // En la próxima fase, este Link nos llevará a /capacitaciones/[id]
              <Link key={cap.id} href={`/capacitaciones/${cap.id}`} className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 group-hover:text-[#D80027] transition-colors">{cap.nombre}</h2>
                  <p className="text-sm text-gray-500 mt-1">Instructor: {cap.instructor}</p>
                  <p className="mt-4 text-gray-700 line-clamp-3">{cap.descripcion}</p>
                </div>
                <div className="bg-gray-50 px-6 py-3">
                    <span className="text-sm font-semibold text-[#D80027]">Ver detalles e inscribirse &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-700">No hay capacitaciones disponibles en este momento.</h2>
            <p className="mt-2 text-gray-500">Por favor, vuelve a consultar más tarde.</p>
          </div>
        )}
      </div>
    </main>
  );
}

// --- getServerSideProps - Ahora solo busca las capacitaciones ---
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  context.res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );

  try {
    const resCapacitaciones = await fetch('http://127.0.0.1:3001/capacitaciones');
    
    if (!resCapacitaciones.ok) {
        console.error('Error fetching data from API');
        return { props: { capacitaciones: [] } };
    }

    const capacitaciones = await resCapacitaciones.json();

    return {
      props: {
        capacitaciones,
      },
    };
  } catch (error) {
    console.error('Failed to connect to the API:', error);
    return { props: { capacitaciones: [] } };
  }
};