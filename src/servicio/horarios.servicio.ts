import { apiFetch } from './api';
import { API_ROUTES } from '../config/api.routes';
import type { HorarioAtencion, HorarioBloqueado } from '../types/dominio.types';

const ID_PELUQUERIA = import.meta.env.VITE_ID_PELUQUERIA;

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
    const { franjas } = await apiFetch<{ franjas: HorarioAtencion[] }>(
      API_ROUTES.horarios.dia(ID_PELUQUERIA, diaSemana)
    );
    return franjas;
  },

  async agregarFranja(datos: DatosFranja): Promise<HorarioAtencion> {
    const { franja } = await apiFetch<{ franja: HorarioAtencion }>(API_ROUTES.horarios.agregarFranja, {
      metodo: 'POST',
      cuerpo: { idPeluqueria: ID_PELUQUERIA, ...datos },
    });
    return franja;
  },

  async eliminarFranja(idFranja: string): Promise<void> {
    await apiFetch<{ eliminado: boolean }>(API_ROUTES.horarios.eliminarFranja(idFranja), {
      metodo: 'DELETE',
    });
  },

  async crearBloqueo(datos: DatosBloqueo): Promise<RespuestaCrearBloqueo> {
    return apiFetch<RespuestaCrearBloqueo>(API_ROUTES.horarios.bloqueo, {
      metodo: 'POST',
      cuerpo: { idPeluqueria: ID_PELUQUERIA, ...datos },
    });
  },

  async listarBloqueos(): Promise<HorarioBloqueado[]> {
    const { bloqueos } = await apiFetch<{ bloqueos: HorarioBloqueado[] }>(
      API_ROUTES.horarios.listarBloqueos(ID_PELUQUERIA)
    );
    return bloqueos;
  },

  async eliminarBloqueo(idBloqueo: string): Promise<void> {
    await apiFetch<{ eliminado: boolean }>(API_ROUTES.horarios.eliminarBloqueo(idBloqueo), {
      metodo: 'DELETE',
    });
  },
};