export type RolUsuario = 'cliente' | 'admin' | 'superadmin';
export type EstadoTurno = 'confirmado' | 'cancelado' | 'completado' | 'falto';
export type CreadoPor = 'cliente' | 'admin';

export interface Perfil {
  id: string;
  id_peluqueria: string | null;
  nombre_completo: string | null;
  telefono: string | null;
  foto_url: string | null;
  rol: RolUsuario;
  creado_en: string;
}

export interface Turno {
  id: string;
  id_peluqueria: string;
  id_cliente: string | null;
  nombre_cliente: string;
  telefono_cliente: string | null;
  fecha: string;
  hora: string;
  precio: number;
  estado: EstadoTurno;
  creado_por: CreadoPor;
  id_turno_fijo: string | null;
  se_aplico_recargo_cancelacion: boolean;
  creado_en: string;
}

export interface SlotDisponible {
  hora: string;
  disponible: boolean;
}