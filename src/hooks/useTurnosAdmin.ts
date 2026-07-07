import { useEffect, useState, useCallback } from 'react';
import { turnosServicio } from '../servicio/turnos.servicio';
import type { Turno } from '../types/dominio.types';

export function useTurnosAdmin(fecha: string) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await turnosServicio.adminListarPorFecha(fecha);
      setTurnos(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los turnos');
    } finally {
      setCargando(false);
    }
  }, [fecha]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { turnos, cargando, error, recargar };
}