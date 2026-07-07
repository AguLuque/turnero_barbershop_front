import { createContext } from 'react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../servicio/db';
import { apiFetch } from '../servicio/api';
import type { Perfil } from '../types/dominio.types';

interface AuthContextValor {
  sesion: Session | null;
  perfil: Perfil | null;
  cargando: boolean;
  errorPerfil: string | null;
  reintentarCargarPerfil: () => Promise<void>;
  iniciarSesionConEmail: (email: string, password: string) => Promise<void>;
  registrarseConEmail: (
    email: string,
    password: string,
    nombreCompleto: string
  ) => Promise<{ requiereConfirmacion: boolean }>;
  cerrarSesion: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValor | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);

  async function cargarPerfil() {
    try {
      setErrorPerfil(null);
      const { perfil: perfilObtenido } = await apiFetch<{ perfil: Perfil }>('/perfiles/mi-perfil');
      setPerfil(perfilObtenido);
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      setPerfil(null);
      setErrorPerfil(
        error instanceof Error ? error.message : 'No se pudo conectar con el servidor'
      );
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSesion(data.session);
      if (data.session) await cargarPerfil();
      setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_evento, nuevaSesion) => {
      setSesion(nuevaSesion);
      if (nuevaSesion) {
        await cargarPerfil();
      } else {
        setPerfil(null);
        setErrorPerfil(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Actualiza sesion y perfil de forma directa e inmediata (sin esperar al listener
  // async de onAuthStateChange), para que al terminar esta funcion el contexto ya
  // este 100% al dia y no haya condicion de carrera con la navegacion posterior.
  async function iniciarSesionConEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    setSesion(data.session);
    await cargarPerfil();
  }

  async function registrarseConEmail(
    email: string,
    password: string,
    nombreCompleto: string
  ): Promise<{ requiereConfirmacion: boolean }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nombreCompleto } },
    });
    if (error) throw new Error(error.message);

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('Ese email ya está registrado. Iniciá sesión en vez de crear una cuenta nueva.');
    }

    if (data.session) {
      setSesion(data.session);
      await cargarPerfil();
    }

    return { requiereConfirmacion: !data.session };
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        sesion,
        perfil,
        cargando,
        errorPerfil,
        reintentarCargarPerfil: cargarPerfil,
        iniciarSesionConEmail,
        registrarseConEmail,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}