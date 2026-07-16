// src/components/turnos/ModalConfirmarBaja.tsx
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
  if (!turnoFijo) return null;

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
          <AlertDialogAction onClick={() => onConfirmar(turnoFijo)}>Sí, dar de baja</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}