import { useEffect, useState, useCallback } from 'react';
import { perfilesServicio } from '../servicio/perfiles.servicio';
import type { Perfil } from '../types/dominio.types';

type CambiosPerfil = Partial<Pick<Perfil, 'nombre_completo' | 'telefono' | 'foto_url'>>;

export function usePerfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await perfilesServicio.obtenerMiPerfil();
      setPerfil(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  async function actualizar(cambios: CambiosPerfil) {
    const actualizado = await perfilesServicio.actualizarMiPerfil(cambios);
    setPerfil(actualizado);
  }

  return { perfil, cargando, error, actualizar };
}