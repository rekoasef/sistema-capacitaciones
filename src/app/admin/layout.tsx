// Layout para las rutas de /admin
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-admin-bg">
      {/* Eliminamos el 'container mx-auto' de aquí.
        Ahora cada página (page.tsx) es responsable de su propio contenedor.
        Esto permite que el Navbar (que está en las páginas) ocupe el 100% del ancho.
      */}
      {children}
    </div>
  );
}