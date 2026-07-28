import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { InputPassword } from '@/components/ui/input-password';
import { Label } from '@/components/ui/label';
import { supabase } from '../servicio/db';
import { APP_ROUTES } from '../config/appRoutes';
import { traducirErrorAuth } from '../utils/traducirErrorAuth';

type EstadoLink = 'verificando' | 'valido' | 'invalido';

export function RestablecerContrasena() {
  const navigate = useNavigate();
  const [estadoLink, setEstadoLink] = useState<EstadoLink>('verificando');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Supabase dispara el evento PASSWORD_RECOVERY cuando procesa el link del mail
  // y establece una sesion temporal de recuperacion. Si por algun motivo de timing
  // ese evento ya se disparo antes de que este listener se suscribiera, getSession
  // sirve como respaldo. Si ninguno de los dos confirma una sesion en un tiempo
  // prudencial, asumimos que el link vencio o no es valido.
  useEffect(() => {
    let manejado = false;

    const { data: listener } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'PASSWORD_RECOVERY') {
        manejado = true;
        setEstadoLink('valido');
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!manejado && data.session) {
        manejado = true;
        setEstadoLink('valido');
      }
    });

    const timeout = setTimeout(() => {
      if (!manejado) setEstadoLink('invalido');
    }, 8000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const formularioValido = password.length >= 6 && password === confirmarPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    if (!formularioValido) return;
    setEnviando(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);

      // Cerramos la sesion temporal de recuperacion para que el usuario inicie
      // sesion de nuevo ya con la contraseña nueva, en vez de quedar logueado
      // con una sesion que se creo solo para este flujo.
      await supabase.auth.signOut();
      toast.success('Contraseña actualizada. Iniciá sesión con tu contraseña nueva.');
      navigate(APP_ROUTES.auth.login, { replace: true });
    } catch (error) {
      const mensajeOriginal = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      toast.error(traducirErrorAuth(mensajeOriginal));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/40 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <img src="/Logo.png" alt="Barber Cache" className="h-20 w-20 rounded-full object-cover" />
        <h1 className="text-2xl font-bold tracking-tight">TurneroBarber</h1>
        <p className="text-sm text-muted-foreground">Reservá tu turno en segundos</p>
      </div>

      <Card className="w-full max-w-sm shadow-lg">
        {estadoLink === 'verificando' && (
          <>
            <CardHeader className="space-y-1.5">
              <CardTitle className="text-xl">Verificando el link...</CardTitle>
              <CardDescription>Esperá un momento mientras confirmamos que es válido</CardDescription>
            </CardHeader>
          </>
        )}

        {estadoLink === 'invalido' && (
          <>
            <CardHeader className="space-y-1.5">
              <CardTitle className="text-xl">El link expiró o no es válido</CardTitle>
              <CardDescription>Pedí uno nuevo para poder restablecer tu contraseña</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={() => navigate(APP_ROUTES.auth.recuperarContrasena, { replace: true })}
              >
                Pedir un link nuevo
              </Button>
            </CardFooter>
          </>
        )}

        {estadoLink === 'valido' && (
          <>
            <CardHeader className="space-y-1.5">
              <CardTitle className="text-xl">Restablecer contraseña</CardTitle>
              <CardDescription>Elegí una contraseña nueva para tu cuenta</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password-nueva">Contraseña nueva</Label>
                  <InputPassword
                    id="password-nueva"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-confirmar">Confirmar contraseña nueva</Label>
                  <InputPassword
                    id="password-confirmar"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  {confirmarPassword && password !== confirmarPassword && (
                    <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="mt-2 pt-2">
                <Button type="submit" className="w-full" size="lg" disabled={!formularioValido || enviando}>
                  {enviando ? 'Guardando...' : 'Guardar contraseña nueva'}
                </Button>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
