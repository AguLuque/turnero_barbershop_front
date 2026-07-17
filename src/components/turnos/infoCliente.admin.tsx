import { MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ClienteAdmin } from '../../types/dominio.types';
import { armarLinkWhatsapp } from '../../utils/whatsapp';

interface Props {
  cliente: ClienteAdmin;
  posicion: number;
}

export function TarjetaCliente({ cliente, posicion }: Props) {
  const { nombre, telefono, esFijo, cantidadTurnos } = cliente;

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {posicion}
          </div>
          <div>
            <p className="font-medium">{nombre}</p>
            {telefono && (
              <a
                href={armarLinkWhatsapp(telefono, `Hola ${nombre}!`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-green-600 hover:underline"
              >
                <MessageCircle size={14} />
                Enviar mensaje
              </a>
            )}
          </div>
        </div>

        {esFijo ? (
          <Badge className="bg-blue-100 text-blue-700">Cliente fijo</Badge>
        ) : (
          <Badge variant="secondary">
            {cantidadTurnos} {cantidadTurnos === 1 ? 'turno' : 'turnos'}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}