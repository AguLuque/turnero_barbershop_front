import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/useAuth';
import type { RolUsuario } from '../types/dominio.types';
import { APP_ROUTES } from './appRoutes';

interface Props {
  children: ReactNode;
  // Si no se pasa, alcanza con estar logueado (sin importar el rol).
  // Si se pasa, solo entra si perfil.rol esta incluido en la lista.
  allowedRoles?: RolUsuario[];
}

export function RutaProtegida({ children, allowedRoles }: Props) {
  const { sesion, perfil, cargando, errorPerfil, reintentarCargarPerfil, cerrarSesion } = useAuth();

  if (cargando) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (!sesion) {
    return <Navigate to={APP_ROUTES.auth.login} replace />;
  }

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

  if (allowedRoles && !allowedRoles.includes(perfil.rol)) {
    return <Navigate to={APP_ROUTES.cliente.root} replace />;
  }

  return <>{children}</>;
}