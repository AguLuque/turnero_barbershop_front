// src/components/turnos/ModalConfirmarBaja.tsx
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import type { TurnoFijo } from '../../types/dominio.types';

interface Props {
  turnoFijo: TurnoFijo | null;
  cliente?: undefined;
  onCerrar: () => void;
  onConfirmar: (turnoFijo: TurnoFijo) => Promise<void>;
}

export function ModalConfirmarBaja({ turnoFijo, onCerrar, onConfirmar }: Props) {
  const [procesando, setProcesando] = useState(false);

  if (!turnoFijo) return null;

  const handleConfirmar = async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      await onConfirmar(turnoFijo);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <AlertDialog open={!!turnoFijo} onOpenChange={(open) => !open && onCerrar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Dar de baja este turno fijo?</AlertDialogTitle>
          <AlertDialogDescription>
            Se va a desactivar la reserva recurrente de{' '}
            <strong>{turnoFijo.nombre_cliente ?? 'este cliente'}</strong>. Los turnos ya generados no se
            cancelan solos, solo dejan de crearse los próximos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmar} disabled={procesando}>
            {procesando ? 'Dando de baja...' : 'Sí, dar de baja'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}