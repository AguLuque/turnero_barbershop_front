import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '../servicio/db';
import { APP_ROUTES } from '../config/appRoutes';
import { traducirErrorAuth } from '../utils/traducirErrorAuth';

export function RecuperarContrasena() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${APP_ROUTES.auth.restablecerContrasena}`,
      });
      if (error) throw new Error(error.message);
      toast.success('Te enviamos un link a tu email para que puedas restablecer tu contraseña');
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
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
          <CardDescription>Ingresá tu email y te enviamos un link para restablecerla</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@mail.com"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="mt-2 flex-col gap-4 pt-2">
            <Button type="submit" className="w-full" size="lg" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar link de recuperación'}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => navigate(APP_ROUTES.auth.login)}
            >
              Volver a iniciar sesión
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
