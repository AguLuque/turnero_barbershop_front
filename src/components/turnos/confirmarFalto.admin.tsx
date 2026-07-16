// src/components/turnos/confirmarFalto.admin.tsx
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

export function ModalConfirmarFalto({ turno, onCerrar, onConfirmar }: Props) {
  if (!turno) return null;

  return (
    <AlertDialog open={!!turno} onOpenChange={(open) => !open && onCerrar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Marcar este turno como falto?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás por marcar que <strong>{turno.nombre_cliente}</strong> no se presentó a su turno de las{' '}
            {formatearHora(turno.hora)} hs. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirmar(turno)}>Sí, marcar falto</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}