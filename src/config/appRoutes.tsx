export const APP_ROUTES = {
  auth: {
    login: '/login',
  },
  cliente: {
    root: '/',
    misTurnos: '/mis-turnos',
    perfil: '/perfil',
  },
  admin: {
    root: '/admin',
    turnosFijos: '/admin/fijos',
    horarios: '/admin/horarios',
    clientes: '/admin/clientes',
  },
} as const;