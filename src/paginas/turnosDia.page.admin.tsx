import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTurnosAdmin } from '../hooks/useTurnosAdmin';
import { turnosServicio } from '../servicio/turnos.servicio';
import { TarjetaTurnoAdmin } from '../components/turnos/infoTurno.admin';
import { AdminFormularioTurno } from '../components/turnos/formularioTurno.admin';
import { ModalCancelar } from '../components/turnos/cancelar.cliente';
import { fechaAISO, formatearFechaLegible } from '../utils/formatoFecha';
import type { Turno } from '../types/dominio.types';

function sumarDias(fecha: Date, dias: number): Date {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
}

export function TurnosDelDia() {
  const [fecha, setFecha] = useState(new Date());
  const fechaISO = fechaAISO(fecha);
  const { turnos, cargando, recargar } = useTurnosAdmin(fechaISO);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [turnoAConfirmarFalto, setTurnoAConfirmarFalto] = useState<Turno | null>(null);

  async function handleConfirmarFalto(turno: Turno) {
    try {
      await turnosServicio.marcarFalto(turno.id);
      toast.success('Turno marcado como falto correctamente');
      await recargar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo marcar el turno como falto');
    } finally {
      setTurnoAConfirmarFalto(null);
    }
  }

  async function handleCancelar(turno: Turno) {
    try {
      await turnosServicio.cancelar(turno.id);
      toast.success('Turno cancelado correctamente');
      await recargar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo cancelar el turno');
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setFecha((f) => sumarDias(f, -1))}>
          <ChevronLeft />
        </Button>

        <Popover>
          {/* Antes esto envolvia un <Button> dentro del trigger y generaba un
              <button> anidado dentro de otro <button> (HTML invalido).
              Se soluciona aplicando los estilos de Button directo al trigger,
              sin anidar un segundo elemento boton. */}
          <PopoverTrigger
            className={buttonVariants({ variant: 'ghost', className: 'flex items-center gap-2 capitalize' })}
          >
            <CalendarDays size={18} />
            {formatearFechaLegible(fechaISO)}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={fecha} onSelect={(d) => d && setFecha(d)} />
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" onClick={() => setFecha((f) => sumarDias(f, 1))}>
          <ChevronRight />
        </Button>
      </div>

      <Button onClick={() => setMostrarFormulario(true)} className="w-full gap-2">
        <Plus size={18} />
        Cargar turno manual
      </Button>

      {cargando ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : turnos.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No hay turnos cargados este día</p>
      ) : (
        <div className="flex flex-col gap-3">
          {turnos.map((turno) => (
            <TarjetaTurnoAdmin
              key={turno.id}
              turno={turno}
              onMarcarFalto={setTurnoAConfirmarFalto}
              onCancelar={handleCancelar}
            />
          ))}
        </div>
      )}

      <AdminFormularioTurno
        abierto={mostrarFormulario}
        fecha={fechaISO}
        onCerrar={() => setMostrarFormulario(false)}
        onCreado={recargar}
      />

      <ModalCancelar
        turno={turnoAConfirmarFalto}
        onCerrar={() => setTurnoAConfirmarFalto(null)}
        onConfirmar={handleConfirmarFalto}
      />
    </div>
  );
}