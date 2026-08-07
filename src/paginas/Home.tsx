import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_ROUTES } from '../config/appRoutes';
import { Inicio } from './Inicio.page';

export function Home() {
  const { perfil } = useAuth();

  if (!perfil) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (perfil.rol === 'cliente' && !perfil.telefono) {
    return <Navigate to={APP_ROUTES.cliente.perfil} replace />;
  }

  if (perfil.rol === 'admin' || perfil.rol === 'superadmin') {
    return <Navigate to="/admin" replace />;
  }

  return <Inicio />;
}