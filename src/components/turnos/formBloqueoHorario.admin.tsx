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
import { Calendar } from '@/components/ui/calendar';
import { fechaAISO } from '../../utils/formatoFecha';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (fecha: string, motivo: string) => Promise<void>;
}

export function FormularioBloqueoDia({ abierto, onCerrar, onGuardar }: Props) {
  const [fecha, setFecha] = useState<Date>();
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleGuardar() {
    if (!fecha) return;
    setEnviando(true);
    try {
      await onGuardar(fechaAISO(fecha), motivo.trim());
      setFecha(undefined);
      setMotivo('');
      onCerrar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquear un día</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={fecha}
            onSelect={setFecha}
            disabled={{ before: new Date() }}
            className="mx-auto"
          />

          <div className="space-y-1">
            <Label htmlFor="motivo-bloqueo">Motivo (opcional)</Label>
            <Input
              id="motivo-bloqueo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Feriado, viaje, etc."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={!fecha || enviando}>
            {enviando ? 'Guardando...' : 'Bloquear día completo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}