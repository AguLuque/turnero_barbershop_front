import { apiFetch } from './api';
import { API_ROUTES } from '../config/api.routes';
import type { RespuestaDisponibilidad, Turno } from '../types/dominio.types';
import { obtenerIdPeluqueriaActual } from './peluqueriaActual.servicio';


interface DatosReserva {
  fecha: string;
  hora: string;
  nombreCliente: string;
  telefonoCliente?: string;
}

export const turnosServicio = {
  async obtenerDisponibilidad(fecha: string): Promise<RespuestaDisponibilidad> {
    const idPeluqueria = await obtenerIdPeluqueriaActual();
    return apiFetch<RespuestaDisponibilidad>(
      API_ROUTES.disponibilidad.base(idPeluqueria, fecha),
      { requiereAuth: false }
    );
  },

  async reservar(datos: DatosReserva): Promise<Turno> {
    const idPeluqueria = await obtenerIdPeluqueriaActual();
    const { turno } = await apiFetch<{ turno: Turno }>(API_ROUTES.turnos.base, {
      metodo: 'POST',
      cuerpo: { idPeluqueria: idPeluqueria, ...datos },
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

  async adminListarHistorial(idCliente: string | null, nombreCliente: string | null, telefonoCliente: string | null): Promise<Turno[]> {
    const params = new URLSearchParams();
    if (idCliente) params.set('idCliente', idCliente);
    if (nombreCliente) params.set('nombreCliente', nombreCliente);
    if (telefonoCliente) params.set('telefonoCliente', telefonoCliente);

    const { turnos } = await apiFetch<{ turnos: Turno[] }>(`/turnos/admin/historial?${params.toString()}`);
    return turnos;
  },

};