import { useEffect, useState, useCallback } from 'react';
import { turnosServicio } from '../servicio/turnos.servicio';
import type { AvisoOrdenLlegada, SlotDisponible } from '../types/dominio.types';

export function useDisponibilidad(fecha: string) {
  const [slots, setSlots] = useState<SlotDisponible[]>([]);
  const [avisoOrdenLlegada, setAvisoOrdenLlegada] = useState<AvisoOrdenLlegada | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await turnosServicio.obtenerDisponibilidad(fecha);
      setSlots(resultado.slots);
      setAvisoOrdenLlegada(resultado.avisoOrdenLlegada);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar disponibilidad');
    } finally {
      setCargando(false);
    }
  }, [fecha]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { slots, avisoOrdenLlegada, cargando, error, recargar };
}