import { apiFetch } from './api';
import { API_ROUTES } from '../config/api.routes';
import type { TurnoFijo } from '../types/dominio.types';

const ID_PELUQUERIA = import.meta.env.VITE_ID_PELUQUERIA;

interface DatosTurnoFijo {
  idCliente: string;
  diaSemana: number;
  hora: string;
  frecuenciaDias: number;
}

export const turnosFijosServicio = {
  async listar(): Promise<TurnoFijo[]> {
    const { turnosFijos } = await apiFetch<{ turnosFijos: TurnoFijo[] }>(
      API_ROUTES.turnosFijos.listar(ID_PELUQUERIA)
    );
    return turnosFijos;
  },

  async crear(datos: DatosTurnoFijo): Promise<TurnoFijo> {
    const { turnoFijo } = await apiFetch<{ turnoFijo: TurnoFijo }>(API_ROUTES.turnosFijos.base, {
      metodo: 'POST',
      cuerpo: { idPeluqueria: ID_PELUQUERIA, ...datos },
    });
    return turnoFijo;
  },

  async darDeBaja(idTurnoFijo: string): Promise<TurnoFijo> {
    const { turnoFijo } = await apiFetch<{ turnoFijo: TurnoFijo }>(
      API_ROUTES.turnosFijos.darDeBaja(idTurnoFijo),
      { metodo: 'PATCH' }
    );
    return turnoFijo;
  },

  async generarProximos(): Promise<{ cantidadGenerados: number }> {
    return apiFetch<{ cantidadGenerados: number }>(API_ROUTES.turnosFijos.generarProximos, {
      metodo: 'POST',
      cuerpo: { idPeluqueria: ID_PELUQUERIA },
    });
  },
};