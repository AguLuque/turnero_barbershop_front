import { apiFetch } from './api';
import { API_ROUTES } from '../config/api.routes';
import type { ClienteAdmin, Perfil } from '../types/dominio.types';

const ID_PELUQUERIA = import.meta.env.VITE_ID_PELUQUERIA;

type CambiosPerfil = Partial<Pick<Perfil, 'nombre_completo' | 'telefono' | 'foto_url'>>;

export const perfilesServicio = {
  async obtenerMiPerfil(): Promise<Perfil> {
    const { perfil } = await apiFetch<{ perfil: Perfil }>(API_ROUTES.perfiles.miPerfil);
    return perfil;
  },

  async actualizarMiPerfil(cambios: CambiosPerfil): Promise<Perfil> {
    const cuerpo: Record<string, unknown> = {};
    if (cambios.nombre_completo !== undefined) cuerpo.nombreCompleto = cambios.nombre_completo;
    if (cambios.telefono !== undefined) cuerpo.telefono = cambios.telefono;
    if (cambios.foto_url !== undefined) cuerpo.fotoUrl = cambios.foto_url;

    const { perfil } = await apiFetch<{ perfil: Perfil }>(API_ROUTES.perfiles.miPerfil, {
      metodo: 'PATCH',
      cuerpo,
    });
    return perfil;
  },

  async adminListarClientes(): Promise<ClienteAdmin[]> {
    const { clientes } = await apiFetch<{ clientes: ClienteAdmin[] }>(
      API_ROUTES.perfiles.clientes(ID_PELUQUERIA)
    );
    return clientes;
  },
};