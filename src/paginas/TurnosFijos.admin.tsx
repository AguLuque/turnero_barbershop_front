// src/paginas/admin/TurnosFijos.tsx
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTurnosFijos } from '../hooks/useTurnosFijos';
import { TarjetaTurnoFijo } from '../components/turnos/infoTurnoFijo.admin';
import { FormularioTurnoFijo } from '../components/turnos/formularioTurnoFijo.admin';
import { ModalConfirmarBaja } from '../components/turnos/confirmarBaja.admin';
import type { TurnoFijo } from '../types/dominio.types';

export function TurnosFijos() {
  const { turnosFijos, cargando, crear, darDeBaja } = useTurnosFijos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [turnoFijoABaja, setTurnoFijoABaja] = useState<TurnoFijo | null>(null);

  async function handleCrear(datos: {
    nombreCliente: string;
    telefonoCliente: string;
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

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Turnos fijos</h1>
      
      <Button onClick={() => setMostrarFormulario(true)} className="w-full gap-2">
        <Plus size={18} />
        Nuevo turno fijo
      </Button>

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
            <TarjetaTurnoFijo key={turnoFijo.id} turnoFijo={turnoFijo} onDarDeBaja={setTurnoFijoABaja} />
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
        cliente={undefined}
        onCerrar={() => setTurnoFijoABaja(null)}
        onConfirmar={handleConfirmarBaja}
      />
    </div>
  );
}