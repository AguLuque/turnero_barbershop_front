import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Scissors } from 'lucide-react';
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
import { useAuth } from '../hooks/useAuth';
import { APP_ROUTES } from '../config/appRoutes';
import { traducirErrorAuth } from '../utils/traducirErrorAuth';

type Modo = 'login' | 'registro';

export function Login() {
  const { sesion, iniciarSesionConEmail, registrarseConEmail } = useAuth();
  const navigate = useNavigate();
  const [modo, setModo] = useState<Modo>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (sesion) {
      navigate(APP_ROUTES.cliente.root, { replace: true });
    }
  }, [sesion, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);

    try {
      if (modo === 'login') {
        await iniciarSesionConEmail(email, password);
        toast.success('¡Bienvenido de nuevo!');
        navigate(APP_ROUTES.cliente.root, { replace: true });
      } else {
        const { requiereConfirmacion } = await registrarseConEmail(email, password, nombreCompleto);
        if (requiereConfirmacion) {
          toast.success('Cuenta creada. Te enviamos un mail para confirmarla antes de ingresar.');
          setModo('login');
        } else {
          toast.success('Cuenta creada correctamente');
          navigate(APP_ROUTES.cliente.root, { replace: true });
        }
      }
    } catch (error) {
      const mensajeOriginal = error instanceof Error ? error.message : 'Ocurrió un error inesperado';
      const mensajeTraducido = traducirErrorAuth(mensajeOriginal);

      if (modo === 'login' && mensajeOriginal.toLowerCase().includes('invalid login credentials')) {
        toast.error(mensajeTraducido, {
          action: { label: 'Registrarme', onClick: () => setModo('registro') },
        });
      } else {
        toast.error(mensajeTraducido);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/40 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Scissors size={26} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">TurneroBarber</h1>
        <p className="text-sm text-muted-foreground">Reservá tu turno en segundos</p>
      </div>

      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-xl">{modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</CardTitle>
          <CardDescription>
            {modo === 'login'
              ? 'Ingresá tu email y contraseña para continuar'
              : 'Completá tus datos para crear tu cuenta'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {modo === 'registro' && (
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre y apellido</Label>
                <Input
                  id="nombre"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Juan Perez"
                  required
                />
              </div>
            )}

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

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="mt-2 flex-col gap-4 pt-2">
            <Button type="submit" className="w-full" size="lg" disabled={enviando}>
              {enviando ? 'Cargando...' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
            >
              {modo === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}