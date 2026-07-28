import { apiFetch } from './api';
import { API_ROUTES } from '../config/api.routes';
import type { HorarioAtencion, HorarioBloqueado } from '../types/dominio.types';
import { obtenerIdPeluqueriaActual } from './peluqueriaActual.servicio';

interface DatosFranja {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

interface DatosBloqueo {
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  motivo?: string;
}

interface RespuestaCrearBloqueo {
  bloqueo: HorarioBloqueado;
  turnosCancelados: number;
}

export const horariosServicio = {
  async listarFranjasDelDia(diaSemana: number): Promise<HorarioAtencion[]> {
    const idPeluqueria = await obtenerIdPeluqueriaActual();
    const { franjas } = await apiFetch<{ franjas: HorarioAtencion[] }>(
      API_ROUTES.horarios.dia(idPeluqueria, diaSemana)
    );
    return franjas;
  },

  async agregarFranja(datos: DatosFranja): Promise<HorarioAtencion> {
    const idPeluqueria = await obtenerIdPeluqueriaActual();
    const { franja } = await apiFetch<{ franja: HorarioAtencion }>(API_ROUTES.horarios.agregarFranja, {
      metodo: 'POST',
      cuerpo: { idPeluqueria: idPeluqueria, ...datos },
    });
    return franja;
  },

  async eliminarFranja(idFranja: string): Promise<void> {
    await apiFetch<{ eliminado: boolean }>(API_ROUTES.horarios.eliminarFranja(idFranja), {
      metodo: 'DELETE',
    });
  },

  async crearBloqueo(datos: DatosBloqueo): Promise<RespuestaCrearBloqueo> {
    const idPeluqueria = await obtenerIdPeluqueriaActual();
    return apiFetch<RespuestaCrearBloqueo>(API_ROUTES.horarios.bloqueo, {
      metodo: 'POST',
      cuerpo: { idPeluqueria: idPeluqueria, ...datos },
    });
  },

  async listarBloqueos(): Promise<HorarioBloqueado[]> {
    const idPeluqueria = await obtenerIdPeluqueriaActual();
    const { bloqueos } = await apiFetch<{ bloqueos: HorarioBloqueado[] }>(
      API_ROUTES.horarios.listarBloqueos(idPeluqueria)
    );
    return bloqueos;
  },

  async eliminarBloqueo(idBloqueo: string): Promise<void> {
    await apiFetch<{ eliminado: boolean }>(API_ROUTES.horarios.eliminarBloqueo(idBloqueo), {
      metodo: 'DELETE',
    });
  },
};