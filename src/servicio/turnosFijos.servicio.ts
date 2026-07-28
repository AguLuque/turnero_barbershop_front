// src/servicios/turnosFijos.servicio.ts
import { apiFetch } from './api';
import { API_ROUTES } from '../config/api.routes';
import type { TurnoFijo } from '../types/dominio.types';
import { obtenerIdPeluqueriaActual } from './peluqueriaActual.servicio';

interface DatosTurnoFijo {
  nombreCliente: string;
  telefonoCliente: string;
  diaSemana: number;
  hora: string;
  frecuenciaDias: number;
}

export const turnosFijosServicio = {
  async listar(): Promise<TurnoFijo[]> {
    const idPeluqueria = await obtenerIdPeluqueriaActual();
    const { turnosFijos } = await apiFetch<{ turnosFijos: TurnoFijo[] }>(
      API_ROUTES.turnosFijos.listar(idPeluqueria)
    );
    return turnosFijos;
  },

  async crear(datos: DatosTurnoFijo): Promise<TurnoFijo> {
    const idPeluqueria = await obtenerIdPeluqueriaActual();
    const { turnoFijo } = await apiFetch<{ turnoFijo: TurnoFijo }>(API_ROUTES.turnosFijos.base, {
      metodo: 'POST',
      cuerpo: { idPeluqueria, ...datos },
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
    const idPeluqueria = await obtenerIdPeluqueriaActual();
    return apiFetch<{ cantidadGenerados: number }>(API_ROUTES.turnosFijos.generarProximos, {
      metodo: 'POST',
      cuerpo: { idPeluqueria },
    });
  },
};