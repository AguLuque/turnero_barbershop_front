import { apiFetch } from './api';
import type { SlotDisponible, Turno } from '../types/dominio.types';

const ID_PELUQUERIA = import.meta.env.VITE_ID_PELUQUERIA;

interface DatosReserva {
  fecha: string;
  hora: string;
  nombreCliente: string;
  telefonoCliente?: string;
}

export const turnosServicio = {
  async obtenerDisponibilidad(fecha: string): Promise<SlotDisponible[]> {
    const { slots } = await apiFetch<{ slots: SlotDisponible[] }>(
      `/disponibilidad?idPeluqueria=${ID_PELUQUERIA}&fecha=${fecha}`,
      { requiereAuth: false }
    );
    return slots;
  },

  async reservar(datos: DatosReserva): Promise<Turno> {
    const { turno } = await apiFetch<{ turno: Turno }>('/turnos', {
      metodo: 'POST',
      cuerpo: { idPeluqueria: ID_PELUQUERIA, ...datos },
    });
    return turno;
  },

  async listarMisTurnos(): Promise<Turno[]> {
    const { turnos } = await apiFetch<{ turnos: Turno[] }>('/turnos/mis-turnos');
    return turnos;
  },

  async cancelar(idTurno: string): Promise<Turno> {
    const { turno } = await apiFetch<{ turno: Turno }>(`/turnos/${idTurno}/cancelar`, {
      metodo: 'PATCH',
    });
    return turno;
  },
};