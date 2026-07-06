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
import { esHoy } from '../../utils/formatoFecha';

interface Props {
  turno: Turno | null;
  onCerrar: () => void;
  onConfirmar: (turno: Turno) => Promise<void>;
}

export function ModalCancelar({ turno, onCerrar, onConfirmar }: Props) {
  if (!turno) return null;

  const esMismoDia = esHoy(turno.fecha);

  return (
    <AlertDialog open={!!turno} onOpenChange={(open) => !open && onCerrar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {esMismoDia ? 'Se aplicará un recargo del 50%' : '¿Cancelar este turno?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {esMismoDia
              ? 'Estás cancelando un turno para el día de hoy. Se te cobrará el 50% del valor del corte por la cancelación con tan poca anticipación.'
              : 'El horario quedará libre para que otro cliente lo pueda reservar.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirmar(turno)}>
            {esMismoDia ? 'Cancelar de todas formas' : 'Sí, cancelar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}