import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { HorarioBloqueado } from '../../types/dominio.types';
import { formatearFechaLegible } from '../../utils/formatoFecha';

interface Props {
  bloqueo: HorarioBloqueado;
  onDesbloquear: (bloqueo: HorarioBloqueado) => void;
}

export function TarjetaBloqueo({ bloqueo, onDesbloquear }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-3">
        <div>
          <p className="font-medium capitalize">{formatearFechaLegible(bloqueo.fecha)}</p>
          {bloqueo.hora_inicio && bloqueo.hora_fin ? (
            <p className="text-sm text-muted-foreground">
              {bloqueo.hora_inicio.slice(0, 5)} a {bloqueo.hora_fin.slice(0, 5)} hs
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Día completo</p>
          )}
          {bloqueo.motivo && <p className="text-sm text-muted-foreground">{bloqueo.motivo}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={() => onDesbloquear(bloqueo)}>
          Desbloquear
        </Button>
      </CardContent>
    </Card>
  );
}