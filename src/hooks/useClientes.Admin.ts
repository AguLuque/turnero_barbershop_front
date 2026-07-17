import { useEffect, useState, useCallback } from 'react';
import { perfilesServicio } from '../servicio/perfiles.servicio';
import type { ClienteAdmin } from '../types/dominio.types';

export function useClientes() {
  const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await perfilesServicio.adminListarClientes();
      setClientes(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los clientes');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { clientes, cargando, error, recargar };
}