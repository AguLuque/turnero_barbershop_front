import { apiFetch } from './api';
import type { Peluqueria } from '../types/dominio.types';

let peluqueriaCacheada: Peluqueria | null = null;

export async function obtenerPeluqueriaActual(): Promise<Peluqueria> {
  if (peluqueriaCacheada) return peluqueriaCacheada;

  const { peluqueria } = await apiFetch<{ peluqueria: Peluqueria }>('/peluquerias/actual', {
    requiereAuth: false,
  });
  peluqueriaCacheada = peluqueria;
  return peluqueriaCacheada;
}

export async function obtenerIdPeluqueriaActual(): Promise<string> {
  const peluqueria = await obtenerPeluqueriaActual();
  return peluqueria.id;
}

export async function obtenerDuracionTurnoActual(): Promise<number> {
  const peluqueria = await obtenerPeluqueriaActual();
  return peluqueria.duracion_turno_minutos;
}

export async function actualizarDuracionTurno(duracionMinutos: number): Promise<void> {
  await apiFetch<{ peluqueria: Peluqueria }>('/peluquerias/actual', {
    metodo: 'PATCH',
    cuerpo: { duracionMinutos },
  });
  peluqueriaCacheada = null;
}
