import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { usePerfil } from '../hooks/usePerfil';
import { useAuth } from '../hooks/useAuth';

export function Perfil() {
  const { perfil, cargando, actualizar } = usePerfil();
  const { sesion, cerrarSesion } = useAuth();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre_completo ?? '');
      setTelefono(perfil.telefono ?? '');
    }
  }, [perfil]);

  async function handleGuardar() {
    setGuardando(true);
    try {
      await actualizar({ nombre_completo: nombre, telefono });
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el perfil');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
        <Skeleton className="mx-auto h-24 w-24 rounded-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const email = sesion?.user.email ?? '';
  const inicial = (perfil?.nombre_completo ?? email).charAt(0).toUpperCase();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <div className="flex flex-col items-center gap-2">
        <Avatar className="h-24 w-24">
          <AvatarImage src={perfil?.foto_url ?? undefined} />
          <AvatarFallback>{inicial}</AvatarFallback>
        </Avatar>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      <Separator />

      <div className="space-y-1">
        <Label htmlFor="nombre">Nombre y apellido</Label>
        <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>

      <Button onClick={handleGuardar} disabled={guardando}>
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </Button>

      <Button variant="outline" onClick={cerrarSesion}>
        Cerrar sesión
      </Button>
    </div>
  );
}