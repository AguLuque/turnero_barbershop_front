import type { RolUsuario } from '../types/dominio.types';

export const ROLES = {
  CLIENTE: 'cliente',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
} as const satisfies Record<string, RolUsuario>;