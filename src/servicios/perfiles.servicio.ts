import { apiFetch } from './api';
import type { Perfil } from '../types/dominio.types';

type CambiosPerfil = Partial<Pick<Perfil, 'nombre_completo' | 'telefono' | 'foto_url'>>;

export const perfilesServicio = {
  async obtenerMiPerfil(): Promise<Perfil> {
    const { perfil } = await apiFetch<{ perfil: Perfil }>('/perfiles/mi-perfil');
    return perfil;
  },

  async actualizarMiPerfil(cambios: CambiosPerfil): Promise<Perfil> {
    const cuerpo: Record<string, unknown> = {};
    if (cambios.nombre_completo !== undefined) cuerpo.nombreCompleto = cambios.nombre_completo;
    if (cambios.telefono !== undefined) cuerpo.telefono = cambios.telefono;
    if (cambios.foto_url !== undefined) cuerpo.fotoUrl = cambios.foto_url;

    const { perfil } = await apiFetch<{ perfil: Perfil }>('/perfiles/mi-perfil', {
      metodo: 'PATCH',
      cuerpo,
    });
    return perfil;
  },
};