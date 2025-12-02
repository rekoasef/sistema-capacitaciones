import AdminNavbar from '@/components/ui/AdminNavbar';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <>
      {/* Mantenemos el Navbar visible para dar contexto inmediato */}
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-[calc(100vh-64px)]">
        
        {/* Header Skeleton */}
        <div className="flex items-center mb-8">
            <Skeleton className="w-14 h-14 rounded-lg mr-4" /> {/* Icono */}
            <div>
                <Skeleton className="h-8 w-48 mb-2" /> {/* Título */}
                <Skeleton className="h-4 w-64" /> {/* Subtítulo */}
            </div>
        </div>

        <div className="space-y-8">
            
            {/* 1. KPIs Skeletons (4 Tarjetas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                        <Skeleton className="h-16 w-16 rounded-full mr-4" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Columna Izquierda: Tabla Reciente */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    
                    {/* Filas de la tabla */}
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Columna Derecha: Accesos Rápidos */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <Skeleton className="h-6 w-32 mb-4" />
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                </div>

            </div>
        </div>
        
      </div>
    </>
  );
}