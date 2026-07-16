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
    await apiFetch<void>(API_ROUTES.horarios.eliminarFranja(idFranja), { metodo: 'DELETE' });
  },

  async crearBloqueo(datos: DatosBloqueo): Promise<HorarioBloqueado> {
    const { bloqueo } = await apiFetch<{ bloqueo: HorarioBloqueado }>(API_ROUTES.horarios.bloqueo, {
      metodo: 'POST',
      cuerpo: { idPeluqueria: ID_PELUQUERIA, ...datos },
    });
    return bloqueo;
  },
};