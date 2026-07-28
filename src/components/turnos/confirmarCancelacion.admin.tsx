// src/components/turnos/confirmarCancelacion.admin.tsx
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
import type { Turno } from '../../types/dominio.types';
import { formatearHora } from '../../utils/formatoFecha';

interface Props {
  turno: Turno | null;
  onCerrar: () => void;
  onConfirmar: (turno: Turno) => Promise<void>;
}

export function ModalConfirmarCancelacionAdmin({ turno, onCerrar, onConfirmar }: Props) {
  const [procesando, setProcesando] = useState(false);

  if (!turno) return null;

  const handleConfirmar = async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      await onConfirmar(turno);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <AlertDialog open={!!turno} onOpenChange={(open) => !open && onCerrar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar este turno?</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a cancelar el turno de <strong>{turno.nombre_cliente}</strong> de las{' '}
            {formatearHora(turno.hora)} hs. El horario quedará libre para que otro cliente lo reserve.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmar} disabled={procesando}>
            {procesando ? 'Cancelando...' : 'Sí, cancelar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}