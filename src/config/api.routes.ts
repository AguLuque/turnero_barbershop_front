export const API_ROUTES = {
  perfiles: {
    miPerfil: '/perfiles/mi-perfil',
    clientes: (idPeluqueria: string) => `/perfiles/clientes?idPeluqueria=${idPeluqueria}`,
  },

  turnos: {
    base: '/turnos',
    misTurnos: '/turnos/mis-turnos',
    admin: (fecha: string) => `/turnos/admin?fecha=${fecha}`,
    cancelar: (idTurno: string) => `/turnos/${idTurno}/cancelar`,
    marcarFalto: (idTurno: string) => `/turnos/${idTurno}/falto`,
  },

  turnosFijos: {
    base: '/turnos-fijos',
    listar: (idPeluqueria: string) => `/turnos-fijos?idPeluqueria=${idPeluqueria}`,
    darDeBaja: (idTurnoFijo: string) => `/turnos-fijos/${idTurnoFijo}/baja`,
    generarProximos: '/turnos-fijos/generar-proximos',
  },

  disponibilidad: {
    base: (idPeluqueria: string, fecha: string) =>
      `/disponibilidad?idPeluqueria=${idPeluqueria}&fecha=${fecha}`,
  },

  horarios: {
    dia: (idPeluqueria: string, diaSemana: number) =>
      `/horarios/dia?idPeluqueria=${idPeluqueria}&diaSemana=${diaSemana}`,
    agregarFranja: '/horarios/dia',
    eliminarFranja: (idFranja: string) => `/horarios/dia/${idFranja}`,
    bloqueo: '/horarios/bloqueo',
    listarBloqueos: (idPeluqueria: string) => `/horarios/bloqueo?idPeluqueria=${idPeluqueria}`,
    eliminarBloqueo: (idBloqueo: string) => `/horarios/bloqueo/${idBloqueo}`,
  },
} as const;