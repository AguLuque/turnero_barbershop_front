import { apiFetch } from './api';

let idPeluqueriaCacheado: string | null = null;

export async function obtenerIdPeluqueriaActual(): Promise<string> {
  if (idPeluqueriaCacheado) return idPeluqueriaCacheado;

  const { peluqueria } = await apiFetch<{ peluqueria: { id: string } }>('/peluquerias/actual', {
    requiereAuth: false,
  });
  idPeluqueriaCacheado = peluqueria.id;
  return idPeluqueriaCacheado;
}