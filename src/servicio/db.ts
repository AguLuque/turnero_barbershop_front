import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

const CLAVE_RECORDARME = 'turnero-recordarme';

// Decide en tiempo real donde guardar la sesion:
// si "recordarme" esta activo, persiste en localStorage (sobrevive a cerrar el navegador).
// si no, usa sessionStorage (se pierde la sesion al cerrar la pestaña/navegador).
const storagePersonalizado = {
  getItem: (key: string) => {
    const recuerda = localStorage.getItem(CLAVE_RECORDARME) !== 'false';
    return (recuerda ? localStorage : sessionStorage).getItem(key);
  },
  setItem: (key: string, value: string) => {
    const recuerda = localStorage.getItem(CLAVE_RECORDARME) !== 'false';
    (recuerda ? localStorage : sessionStorage).setItem(key, value);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: storagePersonalizado },
});

export function setRecordarme(valor: boolean): void {
  localStorage.setItem(CLAVE_RECORDARME, String(valor));
}