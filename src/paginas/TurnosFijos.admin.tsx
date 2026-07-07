import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTurnosFijos } from '../hooks/useTurnosFijos';
import { useClientesAdmin } from '../hooks/useClientesAdmin';
import { turnosFijosServicio } from '../servicio/turnosFijos.servicio';
import { TarjetaTurnoFijo } from '../components/turnos/infoTurnoFijo.admin';
import { FormularioTurnoFijo } from '../components/turnos/formularioTurnoFijo.admin';
import { ModalConfirmarBaja } from '../components/turnos/confirmarBaja.admin';
import type { TurnoFijo } from '../types/dominio.types';

export function TurnosFijos() {
  const { turnosFijos, cargando, crear, darDeBaja } = useTurnosFijos();
  const { clientes } = useClientesAdmin();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [turnoFijoABaja, setTurnoFijoABaja] = useState<TurnoFijo | null>(null);
  const [generando, setGenerando] = useState(false);

  function buscarCliente(idCliente: string) {
    return clientes.find((c) => c.perfil.id === idCliente)?.perfil;
  }

  async function handleCrear(datos: {
    idCliente: string;
    diaSemana: number;
    hora: string;
    frecuenciaDias: number;
  }) {
    try {
      await crear(datos);
      toast.success('Turno fijo creado correctamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el turno fijo');
    }
  }

  async function handleConfirmarBaja(turnoFijo: TurnoFijo) {
    try {
      await darDeBaja(turnoFijo.id);
      toast.success('Turno fijo dado de baja');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo dar de baja el turno fijo');
    } finally {
      setTurnoFijoABaja(null);
    }
  }

  async function handleGenerarProximos() {
    setGenerando(true);
    try {
      const { cantidadGenerados } = await turnosFijosServicio.generarProximos();
      toast.success(`Se generaron ${cantidadGenerados} turno(s) nuevo(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron generar los próximos turnos');
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Turnos fijos</h1>

      <div className="flex gap-2">
        <Button onClick={() => setMostrarFormulario(true)} className="flex-1 gap-2">
          <Plus size={18} />
          Nuevo turno fijo
        </Button>
        <Button variant="outline" size="icon" onClick={handleGenerarProximos} disabled={generando}>
          <RefreshCw size={18} className={generando ? 'animate-spin' : ''} />
        </Button>
      </div>

      {cargando ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : turnosFijos.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No hay turnos fijos cargados</p>
      ) : (
        <div className="flex flex-col gap-3">
          {turnosFijos.map((turnoFijo) => (
            <TarjetaTurnoFijo
              key={turnoFijo.id}
              turnoFijo={turnoFijo}
              cliente={buscarCliente(turnoFijo.id_cliente)}
              onDarDeBaja={setTurnoFijoABaja}
            />
          ))}
        </div>
      )}

      <FormularioTurnoFijo
        abierto={mostrarFormulario}
        onCerrar={() => setMostrarFormulario(false)}
        onCrear={handleCrear}
      />

      <ModalConfirmarBaja
        turnoFijo={turnoFijoABaja}
        cliente={turnoFijoABaja ? buscarCliente(turnoFijoABaja.id_cliente) : undefined}
        onCerrar={() => setTurnoFijoABaja(null)}
        onConfirmar={handleConfirmarBaja}
      />
    </div>
  );
}