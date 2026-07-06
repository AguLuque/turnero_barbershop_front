import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RutaProtegida({ children }: { children: ReactNode }) {
  const { sesion, cargando } = useAuth();

  if (cargando) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}