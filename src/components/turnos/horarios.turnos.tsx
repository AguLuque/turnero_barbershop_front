import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { SlotDisponible } from '../../types/dominio.types';

interface Props {
  slots: SlotDisponible[];
  cargando: boolean;
  horaSeleccionada: string | null;
  onSeleccionar: (hora: string) => void;
}

export function GrillaHorarios({ slots, cargando, horaSeleccionada, onSeleccionar }: Props) {
  if (cargando) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-lg font-medium">No hay turnos disponibles este día</p>
        <p className="text-sm text-muted-foreground">Probá eligiendo otra fecha</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => (
        <Button
          key={slot.hora}
          variant={horaSeleccionada === slot.hora ? 'default' : 'outline'}
          disabled={!slot.disponible}
          onClick={() => onSeleccionar(slot.hora)}
        >
          {slot.hora}
        </Button>
      ))}
    </div>
  );
}