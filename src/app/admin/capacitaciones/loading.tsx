import AdminNavbar from '@/components/ui/AdminNavbar';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CapacitacionesLoading() {
  return (
    <>
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        
        {/* Header: Título y Botón */}
        <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-64" /> {/* Título */}
            <Skeleton className="h-10 w-40 rounded-lg" /> {/* Botón "Nueva Capacitación" */}
        </div>
        
        {/* Tabla Skeleton */}
        <div className="p-4 bg-white shadow-xl rounded-xl border border-gray-100">
            
            {/* Encabezado de la tabla */}
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-6 w-48" />
            </div>

            <div className="space-y-4">
                {/* Cabecera de columnas (simulada) */}
                <div className="flex gap-4 pb-2 border-b border-gray-100">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-4 w-24" />
                </div>

                {/* Filas de datos (x5) */}
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center py-3 border-b border-gray-50 last:border-0">
                        <Skeleton className="h-5 w-1/4" /> {/* Nombre */}
                        <Skeleton className="h-4 w-1/3" /> {/* Descripción */}
                        <div className="w-1/6"><Skeleton className="h-6 w-20 rounded-full" /></div> {/* Modalidad */}
                        <div className="w-1/6"><Skeleton className="h-6 w-16 rounded-full" /></div> {/* Estado */}
                        <div className="w-24 flex gap-2 justify-end"> {/* Acciones */}
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="mt-4">
            <Skeleton className="h-4 w-96" /> {/* Nota al pie */}
        </div>
      </div>
    </>
  );
}