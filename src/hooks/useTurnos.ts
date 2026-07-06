import { useEffect, useState, useCallback } from 'react';
import { turnosServicio } from '../servicios/turnos.servicio';
import type { Turno } from '../types/dominio.types';

export function useTurnos() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await turnosServicio.listarMisTurnos();
      setTurnos(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tus turnos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  async function cancelarTurno(idTurno: string) {
    await turnosServicio.cancelar(idTurno);
    await recargar();
  }

  return { turnos, cargando, error, recargar, cancelarTurno };
}