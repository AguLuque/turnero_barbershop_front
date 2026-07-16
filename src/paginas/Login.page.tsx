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

      // Caso especial: si intenta iniciar sesion con credenciales invalidas,
      // damos una guia extra invitando a registrarse, en vez de solo el error seco.
      if (modo === 'login' && mensajeOriginal.toLowerCase().includes('invalid login credentials')) {
        toast.error(mensajeTraducido, {
          action: {
            label: 'Registrarme',
            onClick: () => setModo('registro'),
          },
        });
      } else {
        toast.error(mensajeTraducido);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</CardTitle>
          <CardDescription>
            {modo === 'login'
              ? 'Ingresá tu email y contraseña para reservar tu turno'
              : 'Completá tus datos para crear tu cuenta'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="flex flex-col gap-4">
              {modo === 'registro' && (
                <div className="grid gap-2">
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

              <div className="grid gap-2">
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

              <div className="grid gap-2">
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
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" disabled={enviando}>
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