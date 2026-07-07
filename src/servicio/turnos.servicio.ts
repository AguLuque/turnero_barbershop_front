import { apiFetch } from './api';
import { API_ROUTES } from '../config/api.routes';
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
      API_ROUTES.disponibilidad.base(ID_PELUQUERIA, fecha),
      { requiereAuth: false }
    );
    return slots;
  },

  async reservar(datos: DatosReserva): Promise<Turno> {
    const { turno } = await apiFetch<{ turno: Turno }>(API_ROUTES.turnos.base, {
      metodo: 'POST',
      cuerpo: { idPeluqueria: ID_PELUQUERIA, ...datos },
    });
    return turno;
  },

  async listarMisTurnos(): Promise<Turno[]> {
    const { turnos } = await apiFetch<{ turnos: Turno[] }>(API_ROUTES.turnos.misTurnos);
    return turnos;
  },

  async cancelar(idTurno: string): Promise<Turno> {
    const { turno } = await apiFetch<{ turno: Turno }>(API_ROUTES.turnos.cancelar(idTurno), {
      metodo: 'PATCH',
    });
    return turno;
  },

  async adminListarPorFecha(fecha: string): Promise<Turno[]> {
    const { turnos } = await apiFetch<{ turnos: Turno[] }>(API_ROUTES.turnos.admin(fecha));
    return turnos;
  },

  async marcarFalto(idTurno: string): Promise<Turno> {
    const { turno } = await apiFetch<{ turno: Turno }>(API_ROUTES.turnos.marcarFalto(idTurno), {
      metodo: 'PATCH',
    });
    return turno;
  },
};