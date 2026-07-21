import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TarjetaTurnoAdmin } from '../components/turnos/infoTurno.admin';
import { turnosServicio } from '../servicio/turnos.servicio';
import { fechaAISO } from '../utils/formatoFecha';
import type { ClienteAdmin, Turno } from '../types/dominio.types';

type Tab = 'activos' | 'pasados' | 'cancelados';

export function HistorialCliente() {
  const location = useLocation();
  const navigate = useNavigate();
  const cliente = location.state?.cliente as ClienteAdmin | undefined;

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState<Tab>('activos');

  useEffect(() => {
    if (!cliente) {
      navigate('/admin/clientes', { replace: true });
      return;
    }

    const idClienteReal = cliente.id.startsWith('fijo-') ? null : cliente.id;

    turnosServicio
      .adminListarHistorial(idClienteReal, cliente.nombre, cliente.telefono)
      .then(setTurnos)
      .finally(() => setCargando(false));
  }, [cliente, navigate]);

  const { activos, pasados, cancelados } = useMemo(() => {
    const hoy = fechaAISO(new Date());
    const ordenDesc = (a: Turno, b: Turno) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora);
    const ordenAsc = (a: Turno, b: Turno) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora);

    return {
      activos: turnos.filter((t) => t.estado === 'confirmado' && t.fecha >= hoy).sort(ordenAsc),
      pasados: turnos
        .filter((t) => t.estado === 'completado' || t.estado === 'falto' || (t.estado === 'confirmado' && t.fecha < hoy))
        .sort(ordenDesc),
      cancelados: turnos.filter((t) => t.estado === 'cancelado').sort(ordenDesc),
    };
  }, [turnos]);

  if (!cliente) return null;

  const listaActiva = tab === 'activos' ? activos : tab === 'pasados' ? pasados : cancelados;
  const mensajeVacio = {
    activos: 'No tiene turnos reservados',
    pasados: 'Todavía no tiene turnos anteriores',
    cancelados: 'No tiene turnos cancelados',
  }[tab];

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/clientes')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-semibold">{cliente.nombre}</h1>
      </div>

      <div className="flex border-b">
        {(
          [
            { valor: 'activos', etiqueta: 'ACTIVOS' },
            { valor: 'pasados', etiqueta: 'PASADOS' },
            { valor: 'cancelados', etiqueta: 'CANCELADOS' },
          ] as const
        ).map((item) => (
          <button
            key={item.valor}
            onClick={() => setTab(item.valor)}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              tab === item.valor ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
            }`}
          >
            {item.etiqueta}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : listaActiva.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{mensajeVacio}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {listaActiva.map((turno) => (
            <TarjetaTurnoAdmin key={turno.id} turno={turno} onMarcarFalto={() => {}} onCancelar={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}