import { supabase } from './db';

const API_URL = import.meta.env.VITE_API_URL;

interface OpcionesPeticion {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  cuerpo?: unknown;
  requiereAuth?: boolean;
}

// Si varias peticiones piden refrescar el token al mismo tiempo, todas deben
// esperar UN SOLO refresh compartido (Supabase rota el refresh token en cada
// uso: dos refresh en paralelo hacen que el segundo falle).
let refrescoEnCurso: Promise<string> | null = null;

async function refrescarToken(): Promise<string> {
  if (!refrescoEnCurso) {
    refrescoEnCurso = supabase.auth.refreshSession().then(({ data, error }) => {
      if (error || !data.session) {
        throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
      }
      return data.session.access_token;
    }).finally(() => {
      refrescoEnCurso = null;
    });
  }
  return refrescoEnCurso;
}

async function obtenerToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
  }
  return data.session.access_token;
}

async function hacerPeticion(ruta: string, metodo: string, cuerpo: unknown, token: string | null): Promise<Response> {
  const encabezados: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) encabezados.Authorization = `Bearer ${token}`;

  return fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: encabezados,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
}

export async function apiFetch<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { metodo = 'GET', cuerpo, requiereAuth = true } = opciones;

  let respuesta: Response;
  try {
    const token = requiereAuth ? await obtenerToken() : null;
    respuesta = await hacerPeticion(ruta, metodo, cuerpo, token);

    // El servidor es la unica fuente de verdad sobre si el token sigue siendo
    // valido. Si dice que no (401), refrescamos una vez y reintentamos la
    // misma peticion en vez de intentar adivinar de antemano si iba a vencer.
    if (respuesta.status === 401 && requiereAuth) {
      const tokenNuevo = await refrescarToken();
      respuesta = await hacerPeticion(ruta, metodo, cuerpo, tokenNuevo);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('sesión expiró')) {
      throw error;
    }
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