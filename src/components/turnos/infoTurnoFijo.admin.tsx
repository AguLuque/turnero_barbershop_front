// src/components/turnos/infoTurnoFijo.admin.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TurnoFijo } from '../../types/dominio.types';

const NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface Props {
  turnoFijo: TurnoFijo;
  onDarDeBaja: (turnoFijo: TurnoFijo) => void;
}

export function TarjetaTurnoFijo({ turnoFijo, onDarDeBaja }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="font-medium">{turnoFijo.nombre_cliente ?? 'Cliente'}</p>
          <p className="text-sm text-muted-foreground">
            {NOMBRES_DIA[turnoFijo.dia_semana]} a las {turnoFijo.hora.slice(0, 5)} hs
          </p>
          <p className="text-sm text-muted-foreground">Cada {turnoFijo.frecuencia_dias} días</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => onDarDeBaja(turnoFijo)}>
          Dar de baja
        </Button>
      </CardContent>
    </Card>
  );
}