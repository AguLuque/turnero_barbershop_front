import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { HorarioAtencion } from '../../types/dominio.types';

interface Props {
  franja: HorarioAtencion;
  onEliminar: (franja: HorarioAtencion) => void;
}

export function TarjetaFranjaHoraria({ franja, onEliminar }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-3">
        <p className="font-medium">
          {franja.hora_inicio.slice(0, 5)} a {franja.hora_fin.slice(0, 5)} hs
        </p>
        <Button variant="ghost" size="icon" onClick={() => onEliminar(franja)}>
          <X size={18} />
        </Button>
      </CardContent>
    </Card>
  );
}