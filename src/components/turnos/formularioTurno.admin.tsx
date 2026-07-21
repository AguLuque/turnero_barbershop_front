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
  const [cargandoSlots, setCargandoSlots] = useState(true);
  const [hora, setHora] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (abierto) {
      setHora('');
      setNombre('');
      setTelefono('');
      setCargandoSlots(true);
      turnosServicio
        .obtenerDisponibilidad(fecha)
        .then(setSlots)
        .finally(() => setCargandoSlots(false));
    }
  }, [abierto, fecha]);

  const disponibles = slots.filter((slot) => slot.disponible);
  // Si el peluquero no atiende ese dia (por su horario semanal, o esta bloqueado
  // el dia completo), el back devuelve un array vacio de entrada. Si atiende pero
  // ya se ocuparon todos los horarios, slots trae datos pero ninguno disponible.
  const noAtiendeEsteDia = !cargandoSlots && slots.length === 0;
  const sinTurnosLibres = !cargandoSlots && slots.length > 0 && disponibles.length === 0;

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

            {cargandoSlots ? (
              <p className="text-sm text-muted-foreground">Buscando horarios...</p>
            ) : noAtiendeEsteDia ? (
              <p className="rounded-md bg-muted p-3 text-sm font-medium text-muted-foreground">
                No hay atención este día
              </p>
            ) : sinTurnosLibres ? (
              <p className="rounded-md bg-muted p-3 text-sm font-medium text-muted-foreground">
                Turnos completos, no quedan horarios disponibles
              </p>
            ) : (
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