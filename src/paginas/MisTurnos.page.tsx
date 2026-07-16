import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { TarjetaTurno } from '../components/turnos/infoTurno.cliente';
import { ModalCancelar } from '../components/turnos/cancelar.cliente';
import { useTurnos } from '../hooks/useTurnos';
import { fechaAISO } from '../utils/formatoFecha';
import type { Turno } from '../types/dominio.types';

type Tab = 'activas' | 'pasadas' | 'canceladas';

export function MisTurnos() {
  const { turnos, cargando, cancelarTurno } = useTurnos();
  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null);
  const [tab, setTab] = useState<Tab>('activas');

  const { activas, pasadas, canceladas } = useMemo(() => {
    const hoy = fechaAISO(new Date());

    const esFutura = (t: Turno) => t.fecha > hoy || (t.fecha === hoy);
    const ordenAsc = (a: Turno, b: Turno) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora);
    const ordenDesc = (a: Turno, b: Turno) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora);

    return {
      activas: turnos.filter((t) => t.estado === 'confirmado' && esFutura(t)).sort(ordenAsc),
      pasadas: turnos
        .filter((t) => t.estado === 'completado' || (t.estado === 'confirmado' && !esFutura(t)) || t.estado === 'falto')
        .sort(ordenDesc),
      canceladas: turnos.filter((t) => t.estado === 'cancelado').sort(ordenDesc),
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

  const listaActiva = tab === 'activas' ? activas : tab === 'pasadas' ? pasadas : canceladas;

  const mensajeVacio = {
    activas: 'No tenés turnos reservados',
    pasadas: 'Todavía no tenés turnos anteriores',
    canceladas: 'No tenés turnos cancelados',
  }[tab];

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
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Mis turnos</h1>

      <div className="flex border-b">
        {(
          [
            { valor: 'activas', etiqueta: 'Activos' },
            { valor: 'pasadas', etiqueta: 'Pasados' },
            { valor: 'canceladas', etiqueta: 'Cancelados' },
          ] as const
        ).map((item) => (
          <button
            key={item.valor}
            onClick={() => setTab(item.valor)}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              tab === item.valor
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            }`}
          >
            {item.etiqueta}
          </button>
        ))}
      </div>

      {listaActiva.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{mensajeVacio}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {listaActiva.map((turno) => (
            <TarjetaTurno key={turno.id} turno={turno} onCancelar={setTurnoACancelar} />
          ))}
        </div>
      )}

      <ModalCancelar
        turno={turnoACancelar}
        onCerrar={() => setTurnoACancelar(null)}
        onConfirmar={handleConfirmarCancelacion}
      />
    </div>
  );
}