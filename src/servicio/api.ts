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
    if (!token) throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
    encabezados.Authorization = `Bearer ${token}`;
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: encabezados,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    // fetch rechaza (TypeError) cuando no hay conexion o el servidor no responde,
    // antes de que exista un objeto Response con el que trabajar.
    throw new Error('No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.');
  }

  let datos: unknown;
  try {
    datos = await respuesta.json();
  } catch {
    throw new Error('El servidor respondió de forma inesperada. Intentá de nuevo en unos segundos.');
  }

  if (!respuesta.ok) {
    const mensaje =
      datos && typeof datos === 'object' && 'error' in datos && typeof (datos as { error: unknown }).error === 'string'
        ? (datos as { error: string }).error
        : 'Ocurrió un error inesperado. Intentá de nuevo.';
    throw new Error(mensaje);
  }

  return datos as T;
}