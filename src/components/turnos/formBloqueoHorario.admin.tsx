import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { horariosServicio } from '../../servicio/horarios.servicio';
import { obtenerDuracionTurnoActual } from '../../servicio/peluqueriaActual.servicio';
import { generarHorariosDeFranjas } from '../../utils/horarios';
import { fechaAISO, formatearFechaLegible } from '../../utils/formatoFecha';
import type { HorarioAtencion, HorarioBloqueado } from '../../types/dominio.types';

type TipoBloqueo = 'completo' | 'especifico' | 'orden_llegada';

export interface ItemBloqueo {
  horaInicio?: string;
  horaFin?: string;
  tipo: 'bloqueado' | 'orden_llegada';
}

interface Props {
  abierto: boolean;
  bloqueos: HorarioBloqueado[];
  onCerrar: () => void;
  onGuardar: (fecha: string, motivo: string, items: ItemBloqueo[]) => Promise<void>;
}

// Mismo estilo de generacion que ya usa "Agregar franja horaria": todos los
// horarios del dia completo, sin filtrar por las franjas de atencion, ya que
// "orden de llegada" es un cambio de modalidad y no esta atado a ellas.
function generarHorariosDelDiaCompleto(duracionMinutos: number): string[] {
  const horarios: string[] = [];
  for (let minutos = 0; minutos < 24 * 60; minutos += duracionMinutos) {
    const h = Math.floor(minutos / 60).toString().padStart(2, '0');
    const m = (minutos % 60).toString().padStart(2, '0');
    horarios.push(`${h}:${m}`);
  }
  return horarios;
}

function formatearMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60).toString().padStart(2, '0');
  const m = (minutos % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// Agrupa horarios individuales seleccionados en rangos contiguos segun la
// duracion de turno (ej: 09:00, 09:30 y 11:00 con duracion 30 -> dos grupos:
// 09:00-09:30 y 11:00-11:00). El backend interpreta hora_fin de forma
// incluyente: es la hora de inicio del ultimo horario seleccionado del
// grupo, no ese horario mas la duracion del turno.
function agruparHorariosContiguos(
  horariosSeleccionados: string[],
  duracionMinutos: number
): { horaInicio: string; horaFin: string }[] {
  const minutos = horariosSeleccionados
    .map((h) => {
      const [hh, mm] = h.split(':').map(Number);
      return hh * 60 + mm;
    })
    .sort((a, b) => a - b);

  const grupos: { inicio: number; fin: number; ultimoInicio: number }[] = [];
  for (const m of minutos) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && m === ultimo.fin) {
      ultimo.fin = m + duracionMinutos;
      ultimo.ultimoInicio = m;
    } else {
      grupos.push({ inicio: m, fin: m + duracionMinutos, ultimoInicio: m });
    }
  }

  return grupos.map((g) => ({ horaInicio: formatearMinutos(g.inicio), horaFin: formatearMinutos(g.ultimoInicio) }));
}

export function FormularioBloqueoDia({ abierto, bloqueos, onCerrar, onGuardar }: Props) {
  const [fecha, setFecha] = useState<Date>();
  const [motivo, setMotivo] = useState('');
  const [tipo, setTipo] = useState<TipoBloqueo>('completo');
  const [franjas, setFranjas] = useState<HorarioAtencion[]>([]);
  const [cargandoFranjas, setCargandoFranjas] = useState(false);
  const [duracionTurno, setDuracionTurno] = useState<number | null>(null);
  const [horariosSeleccionados, setHorariosSeleccionados] = useState<string[]>([]);
  const [horaInicioOL, setHoraInicioOL] = useState('');
  const [horaFinOL, setHoraFinOL] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    obtenerDuracionTurnoActual().then(setDuracionTurno);
  }, [abierto]);

  // Cada vez que cambia la fecha, traemos las franjas horarias reales
  // configuradas para ese dia de la semana, asi el peluquero elige horarios
  // que realmente existen en vez de escribir uno a mano.
  useEffect(() => {
    if (!fecha) {
      setFranjas([]);
      return;
    }

    setCargandoFranjas(true);
    setHorariosSeleccionados([]);
    setHoraInicioOL('');
    setHoraFinOL('');
    const diaSemana = fecha.getDay();

    horariosServicio
      .listarFranjasDelDia(diaSemana)
      .then(setFranjas)
      .finally(() => setCargandoFranjas(false));
  }, [fecha]);

  const sinAtencionEseDia = !!fecha && !cargandoFranjas && franjas.length === 0;

  const horariosDelDia = duracionTurno !== null ? generarHorariosDeFranjas(franjas, duracionTurno) : [];
  const horariosDelDiaCompleto = duracionTurno !== null ? generarHorariosDelDiaCompleto(duracionTurno) : [];
  const opcionesHoraFinOL = horaInicioOL
    ? horariosDelDiaCompleto.filter((h) => h > horaInicioOL)
    : horariosDelDiaCompleto;

  const bloqueosDeFecha = fecha ? bloqueos.filter((b) => b.fecha === fechaAISO(fecha)) : [];
  const diaCompletoYaBloqueado = bloqueosDeFecha.some((b) => !b.hora_inicio || !b.hora_fin);

  function toggleHorario(hora: string) {
    setHorariosSeleccionados((actual) =>
      actual.includes(hora) ? actual.filter((h) => h !== hora) : [...actual, hora]
    );
  }

  const gruposEspecificos =
    tipo === 'especifico' && duracionTurno !== null
      ? agruparHorariosContiguos(horariosSeleccionados, duracionTurno)
      : [];

  const formularioValido =
    !!fecha &&
    !sinAtencionEseDia &&
    (tipo === 'completo'
      ? true
      : tipo === 'especifico'
        ? horariosSeleccionados.length > 0
        : !!horaInicioOL && !!horaFinOL);

  function resetear() {
    setFecha(undefined);
    setMotivo('');
    setTipo('completo');
    setFranjas([]);
    setHorariosSeleccionados([]);
    setHoraInicioOL('');
    setHoraFinOL('');
  }

  async function handleConfirmar() {
    if (enviando) return;
    if (!fecha) return;
    setEnviando(true);
    try {
      if (tipo === 'completo') {
        await onGuardar(fechaAISO(fecha), motivo.trim(), [{ tipo: 'bloqueado' }]);
      } else if (tipo === 'especifico' && duracionTurno !== null) {
        await onGuardar(
          fechaAISO(fecha),
          motivo.trim(),
          gruposEspecificos.map((g) => ({ horaInicio: g.horaInicio, horaFin: g.horaFin, tipo: 'bloqueado' as const }))
        );
      } else if (tipo === 'orden_llegada' && horaInicioOL && horaFinOL) {
        await onGuardar(fechaAISO(fecha), motivo.trim(), [
          { horaInicio: horaInicioOL, horaFin: horaFinOL, tipo: 'orden_llegada' },
        ]);
      }
      resetear();
      setMostrarConfirmacion(false);
      onCerrar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear horarios</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={fecha}
              onSelect={setFecha}
              disabled={{ before: new Date() }}
              className="mx-auto"
            />

            {fecha && cargandoFranjas && (
              <p className="text-sm text-muted-foreground">Verificando este día...</p>
            )}

            {sinAtencionEseDia ? (
              <p className="rounded-md bg-muted p-3 text-sm font-medium text-muted-foreground">
                No hay atención este día, no hay nada para bloquear
              </p>
            ) : (
              fecha &&
              !cargandoFranjas && (
                <>
                  <div className="space-y-2">
                    <Label>Qué querés hacer</Label>
                    <RadioGroup value={tipo} onValueChange={(v) => setTipo(v as TipoBloqueo)}>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="completo" id="tipo-completo" disabled={diaCompletoYaBloqueado} />
                        {diaCompletoYaBloqueado && (
                          <p className="text-xs text-muted-foreground">Este día ya está bloqueado completo</p>
                        )}
                        <Label htmlFor="tipo-completo" className="cursor-pointer font-normal">
                          Día completo
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="especifico" id="tipo-especifico" />
                        <Label htmlFor="tipo-especifico" className="cursor-pointer font-normal">
                          Horarios específicos
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="orden_llegada" id="tipo-orden-llegada" />
                        <Label htmlFor="tipo-orden-llegada" className="cursor-pointer font-normal">
                          Orden de llegada
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {tipo === 'especifico' && (
                    <div className="space-y-2">
                      {duracionTurno === null ? (
                        <p className="text-sm text-muted-foreground">Cargando horarios...</p>
                      ) : horariosDelDia.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay horarios para este día</p>
                      ) : (
                        <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1">
                          {horariosDelDia.map((horario) => {
                            const seleccionado = horariosSeleccionados.includes(horario);
                            return (
                              <button
                                key={horario}
                                type="button"
                                onClick={() => toggleHorario(horario)}
                                className={`rounded-lg border-2 p-2 text-center text-sm font-medium transition-colors ${
                                  seleccionado
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-border hover:border-muted-foreground/40'
                                }`}
                              >
                                {horario}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {tipo === 'orden_llegada' && (
                    <div className="space-y-2 rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs font-medium text-blue-700">
                        Este rango va a atenderse por orden de llegada, sin necesidad de reservar turno.
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>Desde</Label>
                          <Select
                            value={horaInicioOL}
                            onValueChange={(v) => {
                              setHoraInicioOL(v ?? '');
                              if (horaFinOL && v && horaFinOL <= v) setHoraFinOL('');
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Elegí un horario">{horaInicioOL}</SelectValue>
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false} className="max-h-56">
                              {horariosDelDiaCompleto.map((h) => (
                                <SelectItem key={h} value={h}>
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Hasta</Label>
                          <Select
                            value={horaFinOL}
                            onValueChange={(v) => setHoraFinOL(v ?? '')}
                            disabled={!horaInicioOL}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Elegí un horario">{horaFinOL}</SelectValue>
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={false} className="max-h-56">
                              {opcionesHoraFinOL.map((h) => (
                                <SelectItem key={h} value={h}>
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="motivo-bloqueo">Motivo (opcional)</Label>
                    <Input
                      id="motivo-bloqueo"
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder="Feriado, turno médico, etc."
                    />
                  </div>
                </>
              )
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button onClick={() => setMostrarConfirmacion(true)} disabled={!formularioValido}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={mostrarConfirmacion} onOpenChange={setMostrarConfirmacion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmás?</AlertDialogTitle>
            <AlertDialogDescription>
              {tipo === 'completo' ? (
                <>
                  Vas a bloquear <strong>todo el día</strong>{' '}
                  <strong>{fecha ? formatearFechaLegible(fechaAISO(fecha)) : ''}</strong>.
                </>
              ) : tipo === 'especifico' ? (
                <>
                  Vas a bloquear el horario de{' '}
                  <strong>
                    {gruposEspecificos.map((g) => `${g.horaInicio} a ${g.horaFin}`).join(', ')} hs
                  </strong>{' '}
                  el día <strong>{fecha ? formatearFechaLegible(fechaAISO(fecha)) : ''}</strong>. El resto del
                  día sigue disponible con normalidad.
                </>
              ) : (
                <>
                  Vas a activar <strong>orden de llegada</strong> de{' '}
                  <strong>
                    {horaInicioOL} a {horaFinOL} hs
                  </strong>{' '}
                  el día <strong>{fecha ? formatearFechaLegible(fechaAISO(fecha)) : ''}</strong>. Ese rango va
                  a dejar de mostrarse como reservable y los clientes van a ver un aviso para acercarse sin
                  turno.
                </>
              )}{' '}
              Si algún cliente ya tenía un turno reservado en ese horario, se cancelará automáticamente y va
              a dejar de aparecer como activo en su cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmar} disabled={enviando}>
              {enviando ? 'Guardando...' : 'Sí, confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
