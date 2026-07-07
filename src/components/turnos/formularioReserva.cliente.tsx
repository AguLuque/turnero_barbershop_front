import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatearFechaLegible } from '../../utils/formatoFecha';

// TODO: cuando exista un endpoint publico de peluqueria, traer este precio del back
// en vez de tenerlo fijo aca (hoy el back ya calcula el precio real al reservar,
// esto es solo para mostrarlo antes de confirmar).
const PRECIO_CORTE = 15000;

interface DatosFormulario {
  nombreCliente: string;
  telefonoCliente: string;
}

interface Props {
  abierto: boolean;
  fecha: string;
  hora: string | null;
  nombreSugerido?: string | null;
  telefonoSugerido?: string | null;
  onCerrar: () => void;
  onConfirmar: (datos: DatosFormulario) => Promise<void>;
}

export function FormularioReserva({
  abierto,
  fecha,
  hora,
  nombreSugerido,
  telefonoSugerido,
  onCerrar,
  onConfirmar,
}: Props) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Al abrir el formulario, se autocompleta con los datos del perfil del cliente logueado.
  // Sigue siendo editable por si quiere reservar a nombre de otra persona.
  useEffect(() => {
    if (abierto) {
      setNombre(nombreSugerido ?? '');
      setTelefono(telefonoSugerido ?? '');
    }
  }, [abierto, nombreSugerido, telefonoSugerido]);

  async function handleConfirmar() {
    if (!nombre.trim()) return;
    setEnviando(true);
    try {
      await onConfirmar({ nombreCliente: nombre.trim(), telefonoCliente: telefono.trim() });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar turno</DialogTitle>
          <DialogDescription>{hora && `${formatearFechaLegible(fecha)} a las ${hora}`}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="nombre">Nombre y apellido</Label>
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Juan Perez" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input
              id="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="3512345678"
            />
          </div>
          <div className="flex items-center justify-between rounded-md bg-muted p-3">
            <span className="text-sm text-muted-foreground">Precio del corte</span>
            <span className="font-semibold">${PRECIO_CORTE.toLocaleString('es-AR')}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={!nombre.trim() || enviando}>
            {enviando ? 'Guardando...' : 'Guardar turno'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}