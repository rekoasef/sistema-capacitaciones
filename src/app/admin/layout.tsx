// ELIMINAMOS EL IMPORT DE AdminNavbar

// Layout principal para todas las rutas dentro de /admin
// NOTA: ELIMINAMOS AdminNavbar de aquí para que no aparezca en /admin/login
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-admin-bg">
      {/* AdminNavbar HA SIDO ELIMINADA DE ESTE LAYOUT */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}