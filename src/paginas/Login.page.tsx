import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText, MapPin } from 'lucide-react';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { Label } from '@/components/ui/label';
import { useAuth } from '../hooks/useAuth';
import { APP_ROUTES } from '../config/appRoutes';
import { traducirErrorAuth } from '../utils/traducirErrorAuth';
import { obtenerPeluqueriaActual } from '../servicio/peluqueriaActual.servicio';
import { armarLinkWhatsapp } from '../utils/whatsapp';
import type { Peluqueria } from '../types/dominio.types';

const COORDENADAS_BARBERIA = { lat: -32.022266865297695, lng: -62.9223240329059 };
const DIRECCION_BARBERIA = 'Raul Dobric 396';
const URL_GOOGLE_MAPS = `https://www.google.com/maps?q=${encodeURIComponent(DIRECCION_BARBERIA)}`;
// Fix del bug conocido de Leaflet + bundlers: sin esto, los iconos default del
// marcador no cargan porque Leaflet resuelve sus rutas relativas al bundle en vez
// de a las imagenes reales.
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type Modo = 'login' | 'registro';

export function Login() {
  const { sesion, iniciarSesionConEmail, registrarseConEmail } = useAuth();
  const navigate = useNavigate();
  const [modo, setModo] = useState<Modo>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [peluqueria, setPeluqueria] = useState<Peluqueria | null>(null);
  const [mostrarPoliticas, setMostrarPoliticas] = useState(false);
  const mapaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sesion) {
      navigate(APP_ROUTES.cliente.root, { replace: true });
    }
  }, [sesion, navigate]);

  useEffect(() => {
    obtenerPeluqueriaActual()
      .then(setPeluqueria)
      .catch(() => setPeluqueria(null));
  }, []);

  // El contenedor del mapa solo se renderiza cuando hay direccion cargada, asi
  // que inicializamos Leaflet en cuanto el ref queda disponible (no en el mount
  // del componente, que es antes de que exista el div).
  useEffect(() => {
    if (!mapaRef.current || !peluqueria?.direccion) return;

    const mapa = L.map(mapaRef.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false }).setView(
      [COORDENADAS_BARBERIA.lat, COORDENADAS_BARBERIA.lng],
      16
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapa);

    L.marker([COORDENADAS_BARBERIA.lat, COORDENADAS_BARBERIA.lng]).addTo(mapa);

    return () => {
      mapa.remove();
    };
  }, [peluqueria?.direccion]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);

    try {
      if (modo === 'login') {
        await iniciarSesionConEmail(email, password);
        toast.success('¡Bienvenido de nuevo!');
        navigate(APP_ROUTES.cliente.root, { replace: true });
      } else {
        const { requiereConfirmacion } = await registrarseConEmail(email, password, nombreCompleto, telefono);
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

  const linkWhatsapp = peluqueria?.telefono_contacto
    ? armarLinkWhatsapp(peluqueria.telefono_contacto, 'Hola! Quería hacerte una consulta')
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center bg-muted/40 pb-10">
      <div className="mt-12 flex flex-col items-center gap-2 px-4 text-center">
        <img
          src="/Logo.png"
          alt="Barber Cache"
          className="h-20 w-20 rounded-full border-4 border-background object-cover shadow-md"
        />
        <h1 className="text-2xl font-bold tracking-tight">{peluqueria?.nombre ?? 'TurneroBarber'}</h1>

        {peluqueria?.bio_peluquero ? (
          <p className="max-w-sm text-sm text-muted-foreground">{peluqueria.bio_peluquero}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Reservá tu turno en segundos</p>
        )}
      </div>

      <Card className="mx-4 mt-6 w-full max-w-sm shadow-lg">
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
              <>
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

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    inputMode="numeric"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                    placeholder="3512345678"
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@gmail.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <InputPassword
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              {modo === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate(APP_ROUTES.auth.recuperarContrasena)}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
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

      <div className="mt-6 flex flex-col items-center gap-2 px-4 text-center">
        {peluqueria?.direccion && (
          <>
            <h2 className="text-sm font-semibold text-foreground">Ubicación</h2>
            <a
              href={URL_GOOGLE_MAPS}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              <MapPin size={14} />
              {peluqueria.direccion}
            </a>

            <div
              ref={mapaRef}
              className="isolate h-[250px] w-full max-w-sm overflow-hidden rounded-lg shadow-sm"
            />
          </>
        )}

        {(linkWhatsapp || peluqueria?.instagram) && (
          <div className="flex items-center gap-3">
            {linkWhatsapp && (
              <a
                href={linkWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Escribir por WhatsApp"
                className="flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary transition-colors hover:bg-primary/20 active:bg-primary/25"
              >
                <FaWhatsapp className="size-6" />
              </a>
            )}
            {peluqueria?.instagram && (
              <a
                href={`https://instagram.com/${peluqueria.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver Instagram"
                className="flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary transition-colors hover:bg-primary/20 active:bg-primary/25"
              >
                <FaInstagram className="size-6" />
              </a>
            )}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 gap-1.5 rounded-full text-muted-foreground"
          onClick={() => setMostrarPoliticas(true)}
        >
          <FileText size={14} />
          Políticas de reserva
        </Button>
      </div>

      <Dialog open={mostrarPoliticas} onOpenChange={setMostrarPoliticas}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Políticas de reserva</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Los turnos no pueden cancelarse con menos de 6 horas de anticipación a la hora reservada. Te
            pedimos que seas responsable a la hora de sacar un turno, ya que otro cliente podría estar
            esperando ese horario.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}