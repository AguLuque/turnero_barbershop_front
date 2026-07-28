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
import type { HorarioAtencion } from '../../types/dominio.types';

const NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface Props {
  franja: HorarioAtencion | null;
  onCerrar: () => void;
  onConfirmar: (franja: HorarioAtencion) => Promise<void>;
}

export function ModalConfirmarEliminarFranja({ franja, onCerrar, onConfirmar }: Props) {
  const [procesando, setProcesando] = useState(false);

  if (!franja) return null;

  const handleConfirmar = async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      await onConfirmar(franja);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <AlertDialog open={!!franja} onOpenChange={(open) => !open && onCerrar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este horario?</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a eliminar la franja de <strong>{franja.hora_inicio.slice(0, 5)} a {franja.hora_fin.slice(0, 5)} hs</strong>{' '}
            los días <strong>{NOMBRES_DIA[franja.dia_semana]}</strong>. Los clientes ya no van a poder
            reservar turnos en ese horario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmar} disabled={procesando}>
            {procesando ? 'Eliminando...' : 'Sí, eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}