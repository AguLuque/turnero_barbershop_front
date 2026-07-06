import { supabase } from './db';

const API_URL = import.meta.env.VITE_API_URL;

interface OpcionesPeticion {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  cuerpo?: unknown;
  requiereAuth?: boolean;
}

export async function apiFetch<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { metodo = 'GET', cuerpo, requiereAuth = true } = opciones;

  const encabezados: Record<string, string> = { 'Content-Type': 'application/json' };

  if (requiereAuth) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('No hay sesion activa');
    encabezados.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: encabezados,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error ?? 'Error inesperado al conectar con el servidor');
  }

  return datos as T;
}