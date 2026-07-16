import { useEffect, useState, useCallback } from 'react';
import { horariosServicio } from '../servicio/horarios.servicio';
import type { HorarioAtencion } from '../types/dominio.types';

export function useHorarios(diaSemana: number) {
  const [franjas, setFranjas] = useState<HorarioAtencion[]>([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await horariosServicio.listarFranjasDelDia(diaSemana);
      setFranjas(resultado);
    } finally {
      setCargando(false);
    }
  }, [diaSemana]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { franjas, cargando, recargar };
}