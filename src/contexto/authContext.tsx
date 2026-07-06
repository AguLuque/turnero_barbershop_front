import { createContext } from 'react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../servicios/db';
import { apiFetch } from '../servicios/api';
import type { Perfil } from '../types/dominio.types';

interface AuthContextValor {
  sesion: Session | null;
  perfil: Perfil | null;
  cargando: boolean;
  iniciarSesionConEmail: (email: string, password: string) => Promise<void>;
  registrarseConEmail: (email: string, password: string, nombreCompleto: string) => Promise<{ requiereConfirmacion: boolean }>;
  cerrarSesion: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValor | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);

  async function cargarPerfil() {
    try {
      const { perfil: perfilObtenido } = await apiFetch<{ perfil: Perfil }>('/perfiles/mi-perfil');
      setPerfil(perfilObtenido);
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      setPerfil(null);
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
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function iniciarSesionConEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
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

    return { requiereConfirmacion: !data.session };
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{ sesion, perfil, cargando, iniciarSesionConEmail, registrarseConEmail, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
}