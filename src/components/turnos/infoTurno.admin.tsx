import { MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Turno } from '../../types/dominio.types';
import { formatearHora, fechaAISO } from '../../utils/formatoFecha';
import { armarLinkWhatsapp } from '../../utils/whatsapp';

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
  onMarcarFalto: (turno: Turno) => void;
  onCancelar: (turno: Turno) => void;
}

export function TarjetaTurnoAdmin({ turno, onMarcarFalto, onCancelar }: Props) {
  const mensajeWhatsapp = `Hola ${turno.nombre_cliente}! Te escribo por tu turno de las ${formatearHora(turno.hora)} hs en la barbería.`;

  const turnoTodaviaNoOcurrio = turno.fecha > fechaAISO(new Date());
  const mostrarBotonFalto = turno.estado === 'confirmado' && !turnoTodaviaNoOcurrio;
  const mostrarBotonCancelar = turno.estado === 'confirmado';

  return (
    <Card className="py-0">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="flex flex-col gap-1">
          <p className="font-medium">{formatearHora(turno.hora)} hs</p>
          <p className="text-sm text-muted-foreground">{turno.nombre_cliente}</p>
          {turno.telefono_cliente && (
            <a
              href={armarLinkWhatsapp(turno.telefono_cliente, mensajeWhatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1 text-sm text-green-600 hover:underline"
            >
              <MessageCircle size={14} />
              Enviar mensaje
            </a>
          )}
          <Badge className={`mt-1 w-fit ${ESTILOS_ESTADO[turno.estado]}`}>
            {ETIQUETAS_ESTADO[turno.estado]}
          </Badge>
        </div>

        {(mostrarBotonFalto || mostrarBotonCancelar) && (
          <div className="flex flex-col items-end gap-2">
            {mostrarBotonFalto && (
              <Button variant="outline" size="sm" onClick={() => onMarcarFalto(turno)}>
                Marcar falto
              </Button>
            )}
            {mostrarBotonCancelar && (
              <Button variant="ghost" size="sm" onClick={() => onCancelar(turno)}>
                Cancelar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}