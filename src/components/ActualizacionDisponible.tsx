import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Sparkles } from 'lucide-react';

export function ActualizacionDisponible() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <AlertDialog open={needRefresh}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles size={24} />
          </div>
          <AlertDialogTitle className="text-center">¡Hay novedades!</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Actualizamos la aplicación con mejoras. Actualizá ahora para seguir disfrutando de la
            mejor experiencia, sin perder nada de lo que ya cargaste.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction className="w-full" onClick={() => updateServiceWorker(true)}>
            Actualizar ahora
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
