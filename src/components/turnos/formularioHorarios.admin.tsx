import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (horaInicio: string, horaFin: string) => Promise<void>;
}

export function FormularioFranjaHoraria({ abierto, onCerrar, onGuardar }: Props) {
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [enviando, setEnviando] = useState(false);

  const formularioCompleto = horaInicio && horaFin;

  async function handleGuardar() {
    if (!formularioCompleto) return;
    setEnviando(true);
    try {
      await onGuardar(horaInicio, horaFin);
      setHoraInicio('');
      setHoraFin('');
      onCerrar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar franja horaria</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="hora-inicio-franja">Desde</Label>
            <Input
              id="hora-inicio-franja"
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hora-fin-franja">Hasta</Label>
            <Input
              id="hora-fin-franja"
              type="time"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={!formularioCompleto || enviando}>
            {enviando ? 'Guardando...' : 'Agregar franja'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}