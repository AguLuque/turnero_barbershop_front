import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, CalendarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHorarios } from '../hooks/useHorarios';
import { horariosServicio } from '../servicio/horarios.servicio';
import { TarjetaFranjaHoraria } from '../components/turnos/InfoHorarios.admin';
import { FormularioFranjaHoraria } from '../components/turnos/formularioHorarios.admin';
import { FormularioBloqueoDia } from '../components/turnos/formBloqueoHorario.admin';
import type { HorarioAtencion } from '../types/dominio.types';

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
  const [mostrarFormularioBloqueo, setMostrarFormularioBloqueo] = useState(false);

  async function handleAgregarFranja(horaInicio: string, horaFin: string) {
    try {
      await horariosServicio.agregarFranja({ diaSemana, horaInicio, horaFin });
      toast.success('Franja horaria agregada');
      await recargar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo agregar la franja');
    }
  }

  async function handleEliminarFranja(franja: HorarioAtencion) {
    try {
      await horariosServicio.eliminarFranja(franja.id);
      toast.success('Franja horaria eliminada');
      await recargar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar la franja');
    }
  }

  async function handleGuardarBloqueo(fecha: string, motivo: string) {
    try {
      await horariosServicio.crearBloqueo({ fecha, motivo: motivo || undefined });
      toast.success('Día bloqueado correctamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo bloquear el día');
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
            <TarjetaFranjaHoraria key={franja.id} franja={franja} onEliminar={handleEliminarFranja} />
          ))}
        </div>
      )}

      <div className="mt-4 border-t pt-4">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setMostrarFormularioBloqueo(true)}
        >
          <CalendarOff size={18} />
          Bloquear un día puntual
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Usalo para feriados o imprevistos, sin afectar la configuración habitual.
        </p>
      </div>

      <FormularioFranjaHoraria
        abierto={mostrarFormularioFranja}
        onCerrar={() => setMostrarFormularioFranja(false)}
        onGuardar={handleAgregarFranja}
      />

      <FormularioBloqueoDia
        abierto={mostrarFormularioBloqueo}
        onCerrar={() => setMostrarFormularioBloqueo(false)}
        onGuardar={handleGuardarBloqueo}
      />
    </div>
  );
}