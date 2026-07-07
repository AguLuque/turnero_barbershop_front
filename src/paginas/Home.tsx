import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { Inicio } from './Inicio.page';

export function Home() {
  const { perfil, errorPerfil, reintentarCargarPerfil, cerrarSesion } = useAuth();

  if (errorPerfil) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-medium">No pudimos cargar tu perfil</p>
        <p className="text-sm text-muted-foreground">{errorPerfil}</p>
        <div className="flex gap-2">
          <Button onClick={reintentarCargarPerfil}>Reintentar</Button>
          <Button variant="outline" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (perfil.rol === 'admin' || perfil.rol === 'superadmin') {
    return <Navigate to="/admin" replace />;
  }

  return <Inicio />;
}