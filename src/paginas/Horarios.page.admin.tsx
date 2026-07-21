import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, CalendarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHorarios } from '../hooks/useHorarios';
import { horariosServicio } from '../servicio/horarios.servicio';
import { TarjetaFranjaHoraria } from '../components/turnos/InfoHorarios.admin';
import { FormularioFranjaHoraria } from '../components/turnos/formularioHorarios.admin';
import { FormularioBloqueoDia } from '../components/turnos/formBloqueoHorario.admin';
import type { HorarioAtencion, HorarioBloqueado } from '../types/dominio.types';
import { ModalConfirmarEliminarFranja } from '../components/turnos/confirmarEliminarHorarios.admin';
import { TarjetaBloqueo } from '../components/turnos/InfoBloqueoHorario.admin';
import { ModalConfirmarDesbloqueo } from '../components/turnos/confirmarDesbloqueoHorario.admin';

const DIAS_SEMANA = [
  { valor: 1, etiqueta: 'Lunes' },
  { valor: 2, etiqueta: 'Martes' },
  { valor: 3, etiqueta: 'Miércoles' },
  { valor: 4, etiqueta: 'Jueves' },
  { valor: 5, etiqueta: 'Viernes' },
  { valor: 6, etiqueta: 'Sábado' },
  { valor: 0, etiqueta: 'Domingo' },
];

export function Horarios() {
  const [diaSemana, setDiaSemana] = useState(1);
  const { franjas, cargando, recargar } = useHorarios(diaSemana);
  const [mostrarFormularioFranja, setMostrarFormularioFranja] = useState(false);
  const [franjaAEliminar, setFranjaAEliminar] = useState<HorarioAtencion | null>(null);

  const [mostrarFormularioBloqueo, setMostrarFormularioBloqueo] = useState(false);
  const [bloqueos, setBloqueos] = useState<HorarioBloqueado[]>([]);
  const [cargandoBloqueos, setCargandoBloqueos] = useState(true);
  const [bloqueoADesbloquear, setBloqueoADesbloquear] = useState<HorarioBloqueado | null>(null);

  async function cargarBloqueos() {
    setCargandoBloqueos(true);
    try {
      const resultado = await horariosServicio.listarBloqueos();
      setBloqueos(resultado);
    } finally {
      setCargandoBloqueos(false);
    }
  }

  useEffect(() => {
    cargarBloqueos();
  }, []);

  async function handleAgregarFranja(horaInicio: string, horaFin: string) {
    try {
      await horariosServicio.agregarFranja({ diaSemana, horaInicio, horaFin });
      toast.success('Franja horaria agregada');
      await recargar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo agregar la franja');
    }
  }

  async function handleConfirmarEliminarFranja(franja: HorarioAtencion) {
    try {
      await horariosServicio.eliminarFranja(franja.id);
      toast.success('Franja horaria eliminada');
      await recargar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar la franja');
    } finally {
      setFranjaAEliminar(null);
    }
  }

  async function handleGuardarBloqueo(fecha: string, motivo: string, horaInicio?: string, horaFin?: string) {
    try {
      const { turnosCancelados } = await horariosServicio.crearBloqueo({
        fecha,
        motivo: motivo || undefined,
        horaInicio,
        horaFin,
      });
      toast.success(
        turnosCancelados > 0
          ? `Horario bloqueado. Se cancelaron ${turnosCancelados} turno(s) que ya estaban reservados.`
          : 'Horario bloqueado correctamente'
      );
      await cargarBloqueos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo bloquear el horario');
    }
  }


  async function handleConfirmarDesbloqueo(bloqueo: HorarioBloqueado) {
    try {
      await horariosServicio.eliminarBloqueo(bloqueo.id);
      toast.success('Día desbloqueado correctamente');
      await cargarBloqueos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo desbloquear el día');
    } finally {
      setBloqueoADesbloquear(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Horarios de atención</h1>

      <div className="flex flex-wrap gap-2">
        {DIAS_SEMANA.map((dia) => (
          <Button
            key={dia.valor}
            size="sm"
            variant={diaSemana === dia.valor ? 'default' : 'outline'}
            onClick={() => setDiaSemana(dia.valor)}
          >
            {dia.etiqueta}
          </Button>
        ))}
      </div>

      <Button onClick={() => setMostrarFormularioFranja(true)} className="w-full gap-2">
        <Plus size={18} />
        Agregar franja horaria
      </Button>

      {cargando ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : franjas.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No atendés este día. Agregá una franja si querés habilitarlo.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {franjas.map((franja) => (
            <TarjetaFranjaHoraria key={franja.id} franja={franja} onEliminar={setFranjaAEliminar} />
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t pt-4">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setMostrarFormularioBloqueo(true)}
        >
          <CalendarOff size={18} />
          Bloquear un día puntual
        </Button>
        <p className="text-xs text-muted-foreground">
          Usalo para feriados o imprevistos, sin afectar la configuración habitual.
        </p>

        <h2 className="mt-2 text-sm font-semibold text-muted-foreground">Días bloqueados</h2>
        {cargandoBloqueos ? (
          <Skeleton className="h-14 w-full" />
        ) : bloqueos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay días bloqueados próximamente</p>
        ) : (
          <div className="flex flex-col gap-2">
            {bloqueos.map((bloqueo) => (
              <TarjetaBloqueo key={bloqueo.id} bloqueo={bloqueo} onDesbloquear={setBloqueoADesbloquear} />
            ))}
          </div>
        )}
      </div>

      <FormularioFranjaHoraria
        abierto={mostrarFormularioFranja}
        onCerrar={() => setMostrarFormularioFranja(false)}
        onGuardar={handleAgregarFranja}
      />

      <ModalConfirmarEliminarFranja
        franja={franjaAEliminar}
        onCerrar={() => setFranjaAEliminar(null)}
        onConfirmar={handleConfirmarEliminarFranja}
      />
      <FormularioBloqueoDia
        abierto={mostrarFormularioBloqueo}
        bloqueos={bloqueos}
        onCerrar={() => setMostrarFormularioBloqueo(false)}
        onGuardar={handleGuardarBloqueo}
      />
      
      <ModalConfirmarDesbloqueo
        bloqueo={bloqueoADesbloquear}
        onCerrar={() => setBloqueoADesbloquear(null)}
        onConfirmar={handleConfirmarDesbloqueo}
      />
    </div>
  );
}