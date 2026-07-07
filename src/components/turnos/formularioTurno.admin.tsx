import { useEffect, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { turnosServicio } from '../../servicio/turnos.servicio';
import type { SlotDisponible } from '../../types/dominio.types';

interface Props {
  abierto: boolean;
  fecha: string;
  onCerrar: () => void;
  onCreado: () => void;
}

export function AdminFormularioTurno({ abierto, fecha, onCerrar, onCreado }: Props) {
  const [slots, setSlots] = useState<SlotDisponible[]>([]);
  const [hora, setHora] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (abierto) {
      setHora('');
      setNombre('');
      setTelefono('');
      turnosServicio.obtenerDisponibilidad(fecha).then(setSlots);
    }
  }, [abierto, fecha]);

  const disponibles = slots.filter((slot) => slot.disponible);

  async function handleGuardar() {
    if (!hora || !nombre.trim()) return;
    setEnviando(true);
    try {
      await turnosServicio.reservar({
        fecha,
        hora,
        nombreCliente: nombre.trim(),
        telefonoCliente: telefono.trim(),
      });
      onCreado();
      onCerrar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cargar turno manual</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Horario</Label>
            <Select value={hora} onValueChange={(value) => setHora(value ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí un horario" />
              </SelectTrigger>
              <SelectContent>
                {disponibles.map((slot) => (
                  <SelectItem key={slot.hora} value={slot.hora}>
                    {slot.hora}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {disponibles.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay horarios libres ese día</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="nombre-admin">Nombre y apellido</Label>
            <Input id="nombre-admin" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="telefono-admin">Teléfono</Label>
            <Input id="telefono-admin" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={!hora || !nombre.trim() || enviando}>
            {enviando ? 'Guardando...' : 'Guardar turno'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}