// src/components/turnos/FormularioTurnoFijo.tsx
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { horariosServicio } from '../../servicio/horarios.servicio';

const DIAS_SEMANA = [
  { valor: 1, etiqueta: 'Lunes' },
  { valor: 2, etiqueta: 'Martes' },
  { valor: 3, etiqueta: 'Miércoles' },
  { valor: 4, etiqueta: 'Jueves' },
  { valor: 5, etiqueta: 'Viernes' },
  { valor: 6, etiqueta: 'Sábado' },
];

const FRECUENCIAS = [
  { valor: 7, etiqueta: 'Cada 7 días' },
  { valor: 14, etiqueta: 'Cada 14 días' },
  { valor: 21, etiqueta: 'Cada 21 días' },
  { valor: 30, etiqueta: 'Cada 30 días' },
];

interface DatosTurnoFijo {
  nombreCliente: string;
  telefonoCliente: string;
  diaSemana: number;
  hora: string;
  frecuenciaDias: number;
}

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onCrear: (datos: DatosTurnoFijo) => Promise<void>;
}

function generarHorariosDeFranjas(franjas: { hora_inicio: string; hora_fin: string }[]): string[] {
  const horarios: string[] = [];
  for (const franja of franjas) {
    const [hIni, mIni] = franja.hora_inicio.slice(0, 5).split(':').map(Number);
    const [hFin, mFin] = franja.hora_fin.slice(0, 5).split(':').map(Number);
    let minutos = hIni * 60 + mIni;
    const minutosFin = hFin * 60 + mFin;
    while (minutos <= minutosFin) {
      const h = Math.floor(minutos / 60).toString().padStart(2, '0');
      const m = (minutos % 60).toString().padStart(2, '0');
      horarios.push(`${h}:${m}`);
      minutos += 30;
    }
  }
  return horarios;
}

export function FormularioTurnoFijo({ abierto, onCerrar, onCrear }: Props) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [hora, setHora] = useState('');
  const [frecuenciaDias, setFrecuenciaDias] = useState('7');
  const [enviando, setEnviando] = useState(false);
  const [horariosValidos, setHorariosValidos] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  const formularioCompleto = nombre.trim() && diaSemana && hora;

  useEffect(() => {
    if (!diaSemana) {
      setHorariosValidos([]);
      return;
    }
    setCargandoHorarios(true);
    setHora('');
    horariosServicio
      .listarFranjasDelDia(Number(diaSemana))
      .then((franjas) => setHorariosValidos(generarHorariosDeFranjas(franjas)))
      .finally(() => setCargandoHorarios(false));
  }, [diaSemana]);

  async function handleGuardar() {
    if (!formularioCompleto) return;
    setEnviando(true);
    try {
      await onCrear({
        nombreCliente: nombre.trim(),
        telefonoCliente: telefono.trim(),
        diaSemana: Number(diaSemana),
        hora,
        frecuenciaDias: Number(frecuenciaDias),
      });
      setNombre('');
      setTelefono('');
      setDiaSemana('');
      setHora('');
      setFrecuenciaDias('7');
      onCerrar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo turno fijo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="nombre-fijo">Nombre y apellido</Label>
            <Input id="nombre-fijo" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Juan Perez" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="telefono-fijo">Teléfono</Label>
            <Input id="telefono-fijo" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="3512345678" />
          </div>

          <div className="space-y-1">
            <Label>Día de la semana</Label>
            <Select value={diaSemana} onValueChange={(v) => setDiaSemana(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí un día">
                  {DIAS_SEMANA.find((d) => String(d.valor) === diaSemana)?.etiqueta}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DIAS_SEMANA.map((dia) => (
                  <SelectItem key={dia.valor} value={String(dia.valor)}>
                    {dia.etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Horario</Label>
            {!diaSemana ? (
              <p className="text-sm text-muted-foreground">Elegí primero un día</p>
            ) : cargandoHorarios ? (
              <p className="text-sm text-muted-foreground">Buscando horarios...</p>
            ) : horariosValidos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ese día no tiene horarios configurados</p>
            ) : (
              <Select value={hora} onValueChange={(v) => setHora(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí un horario">{hora}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {horariosValidos.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1">
            <Label>Frecuencia</Label>
            <Select value={frecuenciaDias} onValueChange={(v) => setFrecuenciaDias(v ?? '7')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FRECUENCIAS.map((frecuencia) => (
                  <SelectItem key={frecuencia.valor} value={String(frecuencia.valor)}>
                    {frecuencia.etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={!formularioCompleto || enviando}>
            {enviando ? 'Guardando...' : 'Guardar turno fijo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}