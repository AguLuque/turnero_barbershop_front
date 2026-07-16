import { useEffect, useState, useCallback } from 'react';
import { turnosFijosServicio } from '../servicio/turnosFijos.servicio';
import type { TurnoFijo } from '../types/dominio.types';

interface DatosTurnoFijo {
  nombreCliente: string;
  telefonoCliente: string;
  diaSemana: number;
  hora: string;
  frecuenciaDias: number;
}

export function useTurnosFijos() {
  const [turnosFijos, setTurnosFijos] = useState<TurnoFijo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await turnosFijosServicio.listar();
      setTurnosFijos(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los turnos fijos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  async function crear(datos: DatosTurnoFijo) {
    await turnosFijosServicio.crear(datos);
    await recargar();
  }

  async function darDeBaja(idTurnoFijo: string) {
    await turnosFijosServicio.darDeBaja(idTurnoFijo);
    await recargar();
  }

  return { turnosFijos, cargando, error, recargar, crear, darDeBaja };
}