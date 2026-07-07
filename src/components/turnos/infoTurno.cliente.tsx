import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Turno } from '../../types/dominio.types';
import { formatearFechaLegible, formatearHora } from '../../utils/formatoFecha';

const ESTILOS_ESTADO: Record<Turno['estado'], string> = {
  confirmado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
  completado: 'bg-blue-100 text-blue-700',
  falto: 'bg-gray-100 text-gray-700',
};

const ETIQUETAS_ESTADO: Record<Turno['estado'], string> = {
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  completado: 'Completado',
  falto: 'Falto',
};

interface Props {
  turno: Turno;
  onCancelar: (turno: Turno) => void;
}

export function TarjetaTurno({ turno, onCancelar }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="font-medium capitalize">{formatearFechaLegible(turno.fecha)}</p>
          <p className="text-sm text-muted-foreground">{formatearHora(turno.hora)} hs</p>
          <p className="text-sm text-muted-foreground">{turno.nombre_cliente}</p>
          <Badge className={`mt-2 ${ESTILOS_ESTADO[turno.estado]}`}>{ETIQUETAS_ESTADO[turno.estado]}</Badge>
        </div>
        {turno.estado === 'confirmado' && (
          <Button variant="outline" size="sm" onClick={() => onCancelar(turno)}>
            Cancelar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}