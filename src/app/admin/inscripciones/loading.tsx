import AdminNavbar from '@/components/ui/AdminNavbar';
import { Skeleton } from '@/components/ui/Skeleton';

export default function InscripcionesLoading() {
  return (
    <>
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-[calc(100vh-64px)]">
        
        {/* Encabezado: Título y Botón Exportar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
             <div className="flex items-center">
                <Skeleton className="w-14 h-14 rounded-lg mr-4" /> {/* Icono */}
                <div>
                    <Skeleton className="h-8 w-64 mb-2" /> {/* Título */}
                    <Skeleton className="h-4 w-32" /> {/* Contador */}
                </div>
             </div>
             <Skeleton className="h-10 w-40 rounded-lg" /> {/* Botón Exportar */}
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between mt-4">
            <Skeleton className="h-10 w-full md:w-1/3 rounded-lg" /> {/* Buscador */}
            <div className="flex gap-2 w-full md:w-auto">
                <Skeleton className="h-10 w-full md:w-48 rounded-lg" /> {/* Filtro Curso */}
                <Skeleton className="h-10 w-full md:w-48 rounded-lg" /> {/* Filtro Concesionario */}
            </div>
        </div>

        {/* Tabla de Datos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4 p-4">
             
             {/* Cabecera de la tabla */}
             <div className="flex gap-4 pb-4 border-b border-gray-100 mb-4 hidden md:flex">
                <Skeleton className="h-4 w-20" /> {/* Fecha */}
                <Skeleton className="h-4 w-40" /> {/* Alumno */}
                <Skeleton className="h-4 w-40" /> {/* Curso */}
                <Skeleton className="h-4 w-32" /> {/* Concesionario */}
                <Skeleton className="h-4 w-32" /> {/* Asistencia */}
                <Skeleton className="h-4 w-10 ml-auto" /> {/* Acciones */}
             </div>

             {/* Filas (x8) */}
             <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-4 items-start md:items-center py-3 border-b border-gray-50 last:border-0">
                        <Skeleton className="h-4 w-20" /> {/* Fecha */}
                        
                        <div className="w-full md:w-40">
                            <Skeleton className="h-4 w-32 mb-1" /> {/* Nombre */}
                            <Skeleton className="h-3 w-24" /> {/* Email */}
                        </div>
                        
                        <div className="w-full md:w-40">
                            <Skeleton className="h-4 w-32 mb-1" /> {/* Curso */}
                            <Skeleton className="h-3 w-20" /> {/* Grupo */}
                        </div>
                        
                        <Skeleton className="h-4 w-32" /> {/* Concesionario */}
                        
                        <Skeleton className="h-8 w-48 rounded-lg" /> {/* Botonera Asistencia */}
                        
                        <Skeleton className="h-8 w-8 rounded-full md:ml-auto" /> {/* Botón Borrar */}
                    </div>
                ))}
             </div>
        </div>
      </div>
    </>
  );
}