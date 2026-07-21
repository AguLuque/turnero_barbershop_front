import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
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
import { horariosServicio } from '../../servicio/horarios.servicio';
import { fechaAISO, formatearFechaLegible } from '../../utils/formatoFecha';
import type { HorarioAtencion, HorarioBloqueado  } from '../../types/dominio.types';

type TipoBloqueo = 'completo' | 'franja';

interface Props {
  abierto: boolean;
  bloqueos: HorarioBloqueado[];
  onCerrar: () => void;
  onGuardar: (fecha: string, motivo: string, horaInicio?: string, horaFin?: string) => Promise<void>;
}

export function FormularioBloqueoDia({ abierto, bloqueos, onCerrar, onGuardar }: Props) {
  const [fecha, setFecha] = useState<Date>();
  const [motivo, setMotivo] = useState('');
  const [tipo, setTipo] = useState<TipoBloqueo>('completo');
  const [franjas, setFranjas] = useState<HorarioAtencion[]>([]);
  const [cargandoFranjas, setCargandoFranjas] = useState(false);
  const [franjaSeleccionada, setFranjaSeleccionada] = useState<HorarioAtencion | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // Cada vez que cambia la fecha (o se elige el modo "franja"), traemos las
  // franjas horarias reales configuradas para ese dia de la semana, asi el
  // peluquero elige entre las que existen en vez de escribir un horario a mano.
  useEffect(() => {
    if (!fecha) {
      setFranjas([]);
      return;
    }

    setCargandoFranjas(true);
    setFranjaSeleccionada(null);
    const diaSemana = fecha.getDay();

    horariosServicio
      .listarFranjasDelDia(diaSemana)
      .then(setFranjas)
      .finally(() => setCargandoFranjas(false));
  }, [fecha]);

  const sinAtencionEseDia = !!fecha && !cargandoFranjas && franjas.length === 0;

  const bloqueosDeFecha = fecha ? bloqueos.filter((b) => b.fecha === fechaAISO(fecha)) : [];
  const diaCompletoYaBloqueado = bloqueosDeFecha.some((b) => !b.hora_inicio || !b.hora_fin);

  function franjaYaBloqueada(franja: HorarioAtencion): boolean {
    return bloqueosDeFecha.some(
      (b) =>
        b.hora_inicio?.slice(0, 5) === franja.hora_inicio.slice(0, 5) &&
        b.hora_fin?.slice(0, 5) === franja.hora_fin.slice(0, 5)
    );
  }

  const formularioValido =
    !!fecha && !sinAtencionEseDia && (tipo === 'completo' || !!franjaSeleccionada);

  function resetear() {
    setFecha(undefined);
    setMotivo('');
    setTipo('completo');
    setFranjas([]);
    setFranjaSeleccionada(null);
  }

  async function handleConfirmar() {
    if (!fecha) return;
    setEnviando(true);
    try {
      if (tipo === 'completo') {
        await onGuardar(fechaAISO(fecha), motivo.trim());
      } else if (franjaSeleccionada) {
        await onGuardar(
          fechaAISO(fecha),
          motivo.trim(),
          franjaSeleccionada.hora_inicio.slice(0, 5),
          franjaSeleccionada.hora_fin.slice(0, 5)
        );
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
                    <Label>Qué querés bloquear</Label>
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
                        <RadioGroupItem value="franja" id="tipo-franja" />
                        <Label htmlFor="tipo-franja" className="cursor-pointer font-normal">
                          Solo una franja horaria
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {tipo === 'franja' && (
                    <div className="flex flex-col gap-2">
                      {franjas.map((franja) => {
                        const seleccionada = franjaSeleccionada?.id === franja.id;
                        const yaBloqueada = franjaYaBloqueada(franja);

                        function handleClick() {
                          if (yaBloqueada) {
                            toast.error('Esa franja horaria ya fue bloqueada');
                            return;
                          }
                          setFranjaSeleccionada(franja);
                        }

                        return (
                          <button
                            key={franja.id}
                            type="button"
                            onClick={handleClick}
                            disabled={yaBloqueada}
                            className={`rounded-lg border-2 p-3 text-left text-sm font-medium transition-colors ${yaBloqueada
                              ? 'cursor-not-allowed border-border bg-muted text-muted-foreground'
                              : seleccionada
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-border hover:border-muted-foreground/40'
                              }`}
                          >
                            {franja.hora_inicio.slice(0, 5)} a {franja.hora_fin.slice(0, 5)} hs
                            {yaBloqueada && ' — Ya bloqueada'}
                          </button>
                        );
                      })}
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
            <AlertDialogTitle>¿Confirmás el bloqueo?</AlertDialogTitle>
            <AlertDialogDescription>
              {tipo === 'completo' ? (
                <>
                  Vas a bloquear <strong>todo el día</strong>{' '}
                  <strong>{fecha ? formatearFechaLegible(fechaAISO(fecha)) : ''}</strong>.
                </>
              ) : (
                <>
                  Vas a bloquear el horario de{' '}
                  <strong>
                    {franjaSeleccionada?.hora_inicio.slice(0, 5)} a {franjaSeleccionada?.hora_fin.slice(0, 5)} hs
                  </strong>{' '}
                  el día <strong>{fecha ? formatearFechaLegible(fechaAISO(fecha)) : ''}</strong>. El resto del
                  día sigue disponible con normalidad.
                </>
              )}{' '}
              Si algún cliente ya tenía un turno reservado en ese horario, se cancelará automáticamente y va
              a dejar de aparecer como activo en su cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmar} disabled={enviando}>
              {enviando ? 'Bloqueando...' : 'Sí, bloquear'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}