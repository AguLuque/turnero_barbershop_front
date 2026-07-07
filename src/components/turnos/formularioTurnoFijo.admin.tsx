import { useState } from 'react';
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
import { useClientesAdmin } from '../../hooks/useClientesAdmin';

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

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  onCrear: (datos: { idCliente: string; diaSemana: number; hora: string; frecuenciaDias: number }) => Promise<void>;
}

export function FormularioTurnoFijo({ abierto, onCerrar, onCrear }: Props) {
  const { clientes, cargando: cargandoClientes } = useClientesAdmin();
  const [idCliente, setIdCliente] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [hora, setHora] = useState('');
  const [frecuenciaDias, setFrecuenciaDias] = useState('7');
  const [enviando, setEnviando] = useState(false);

  const formularioCompleto = idCliente && diaSemana && hora;

  async function handleGuardar() {
    if (!formularioCompleto) return;
    setEnviando(true);
    try {
      await onCrear({
        idCliente,
        diaSemana: Number(diaSemana),
        hora,
        frecuenciaDias: Number(frecuenciaDias),
      });
      setIdCliente('');
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
            <Label>Cliente</Label>
            <Select value={idCliente} onValueChange={(v) => setIdCliente(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder={cargandoClientes ? 'Cargando...' : 'Elegí un cliente'} />
              </SelectTrigger>
              <SelectContent>
                {clientes.map(({ perfil }) => (
                  <SelectItem key={perfil.id} value={perfil.id}>
                    {perfil.nombre_completo ?? perfil.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Día de la semana</Label>
            <Select value={diaSemana} onValueChange={(v) => setDiaSemana(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí un día" />
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
            <Label htmlFor="hora-fija">Horario</Label>
            <Input id="hora-fija" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
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