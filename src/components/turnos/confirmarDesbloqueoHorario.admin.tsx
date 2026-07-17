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
import type { HorarioBloqueado } from '../../types/dominio.types';
import { formatearFechaLegible } from '../../utils/formatoFecha';

interface Props {
  bloqueo: HorarioBloqueado | null;
  onCerrar: () => void;
  onConfirmar: (bloqueo: HorarioBloqueado) => Promise<void>;
}

export function ModalConfirmarDesbloqueo({ bloqueo, onCerrar, onConfirmar }: Props) {
  if (!bloqueo) return null;

  return (
    <AlertDialog open={!!bloqueo} onOpenChange={(open) => !open && onCerrar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Desbloquear este día?</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a habilitar de nuevo <strong className="capitalize">{formatearFechaLegible(bloqueo.fecha)}</strong>{' '}
            para que los clientes puedan reservar turnos. Los turnos que se cancelaron automáticamente al
            bloquear no se restauran solos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirmar(bloqueo)}>Sí, desbloquear</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}