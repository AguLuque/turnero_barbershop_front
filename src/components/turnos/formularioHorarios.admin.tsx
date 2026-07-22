import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (horaInicio: string, horaFin: string) => Promise<void>;
}

const HORARIOS_DEL_DIA: string[] = (() => {
  const horarios: string[] = [];
  for (let minutos = 0; minutos < 24 * 60; minutos += 30) {
    const h = Math.floor(minutos / 60).toString().padStart(2, '0');
    const m = (minutos % 60).toString().padStart(2, '0');
    horarios.push(`${h}:${m}`);
  }
  return horarios;
})();

export function FormularioFranjaHoraria({ abierto, onCerrar, onGuardar }: Props) {
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [enviando, setEnviando] = useState(false);

  const opcionesHoraFin = horaInicio ? HORARIOS_DEL_DIA.filter((h) => h > horaInicio) : HORARIOS_DEL_DIA;

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
            <Label>Desde</Label>
            <Select
              value={horaInicio}
              onValueChange={(v) => {
                setHoraInicio(v ?? '');
                if (horaFin && v && horaFin <= v) setHoraFin('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Elegí un horario">{horaInicio}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {HORARIOS_DEL_DIA.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Hasta</Label>
            <Select value={horaFin} onValueChange={(v) => setHoraFin(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí un horario">{horaFin}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {opcionesHoraFin.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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