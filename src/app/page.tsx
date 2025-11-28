import Navbar from '@/components/ui/Navbar'; // Importación corregida a la ruta relativa

// Este es un Server Component por defecto
export default function HomePage() {
  return (
    <>
      {/* La barra de navegación es esencial para el branding y la accesibilidad.
        La colocamos aquí para que cargue el logo de Crucianelli.
      */}
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Bienvenido al Portal de Capacitaciones Crucianelli
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Explora los cursos disponibles y regístrate para el próximo evento.
        </p>

        {/* Placeholder para la lista de capacitaciones */}
        <div className="mt-10 p-6 bg-admin-bg rounded-lg shadow-inner">
          <p className="text-gray-500 italic">
            [Aquí se listarán las capacitaciones disponibles - Fase 3.2]
          </p>
        </div>
      </div>
    </>
  );
}