import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Inicio } from './Inicio.page';

export function Home() {
  const { perfil } = useAuth();

  if (!perfil) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (perfil.rol === 'admin' || perfil.rol === 'superadmin') {
    return <Navigate to="/admin" replace />;
  }

  return <Inicio />;
}