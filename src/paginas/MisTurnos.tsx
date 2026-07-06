import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { TarjetaTurno } from '../components/turnos/infoTurno.turnos';
import { ModalCancelar } from '../components/turnos/cancelar.turnos';
import { useTurnos } from '../hooks/useTurnos';
import { fechaAISO } from '../utils/formatoFecha';
import type { Turno } from '../types/dominio.types';

export function MisTurnos() {
  const { turnos, cargando, cancelarTurno } = useTurnos();
  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null);

  const { proximos, historial } = useMemo(() => {
    const hoy = fechaAISO(new Date());
    const visibles = turnos.filter((t) => t.estado !== 'falto');

    return {
      proximos: visibles
        .filter((t) => t.fecha >= hoy && t.estado === 'confirmado')
        .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)),
      historial: visibles
        .filter((t) => t.fecha < hoy || t.estado !== 'confirmado')
        .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora)),
    };
  }, [turnos]);

  async function handleConfirmarCancelacion(turno: Turno) {
    try {
      await cancelarTurno(turno.id);
      toast.success('Turno cancelado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo cancelar el turno');
    } finally {
      setTurnoACancelar(null);
    }
  }

  if (cargando) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Próximos turnos</h2>
        {proximos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tenés turnos reservados</p>
        ) : (
          <div className="flex flex-col gap-3">
            {proximos.map((turno) => (
              <TarjetaTurno key={turno.id} turno={turno} onCancelar={setTurnoACancelar} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Historial</h2>
        {historial.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no tenés turnos anteriores</p>
        ) : (
          <div className="flex flex-col gap-3">
            {historial.map((turno) => (
              <TarjetaTurno key={turno.id} turno={turno} onCancelar={setTurnoACancelar} />
            ))}
          </div>
        )}
      </section>

      <ModalCancelar
        turno={turnoACancelar}
        onCerrar={() => setTurnoACancelar(null)}
        onConfirmar={handleConfirmarCancelacion}
      />
    </div>
  );
}