// frontend/src/pages/inscripcion/exito.tsx

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router'; 
import { FiCheckCircle, FiMail, FiRefreshCw, FiHome } from 'react-icons/fi';

export default function InscripcionExitoPage() {
  const router = useRouter(); // HOOK CALL 1

  // FIX: Verificación explícita de isReady para evitar el error "fewer hooks"
  if (!router.isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-700">
        Cargando confirmación...
      </div>
    );
  }

  // Solo leemos la query una vez que el router está listo
  const { c_id } = router.query; 

  // Si tenemos el ID, construimos el enlace de vuelta al detalle, si no, volvemos al catálogo principal.
  const linkToCapacitacion = c_id ? `/capacitaciones/${c_id}` : '/';
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Inscripción Exitosa - Crucianelli</title>
      </Head>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl border border-green-100">
        
        {/* Encabezado de Éxito */}
        <div className="text-center">
          <FiCheckCircle className="mx-auto h-20 w-20 text-green-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ¡Inscripción Confirmada!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tu registro se ha completado con éxito.
          </p>
        </div>

        {/* Detalles y Instrucciones (R2) */}
        <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 text-center">
            <FiMail className="mx-auto h-8 w-8 text-blue-600 mb-2" />
            <h3 className="text-lg font-semibold text-gray-800">Revisa tu Correo Electrónico</h3>
            <p className="text-gray-700 mt-1">
                Te hemos enviado un email con todos los detalles del curso, incluyendo **fecha, hora y ubicación**.
            </p>
            <p className="text-xs text-red-500 mt-2">
                Si no lo ves, revisa tu carpeta de Spam.
            </p>
        </div>

        {/* Opciones de Acción (R2) */}
        <div className="mt-6 space-y-3">
          <Link
            href="/"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors items-center"
          >
            <FiHome className="h-5 w-5 mr-2" />
            Volver al Catálogo
          </Link>
          
          <Link
            href={linkToCapacitacion}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors items-center"
          >
            <FiRefreshCw className="h-5 w-5 mr-2" />
            {c_id ? 'Inscribir a Otro (Mismo Curso)' : 'Volver al Catálogo'}
          </Link>
        </div>
      </div>
    </div>
  );
}