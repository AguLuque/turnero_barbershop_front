import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { GrillaHorarios } from '../components/turnos/horarios.cliente';
import { FormularioReserva } from '../components/turnos/formularioReserva.cliente';
import { useDisponibilidad } from '../hooks/useDisponibilidad';
import { usePerfil } from '../hooks/usePerfil';
import { turnosServicio } from '../servicio/turnos.servicio';
import { fechaAISO } from '../utils/formatoFecha';

export function Inicio() {
  const [fecha, setFecha] = useState<Date>(new Date());
  const fechaISO = fechaAISO(fecha);
  const { slots, cargando, recargar } = useDisponibilidad(fechaISO);
  const { perfil } = usePerfil();
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);

  async function handleConfirmar(datos: { nombreCliente: string; telefonoCliente: string }) {
    if (!horaSeleccionada) return;
    try {
      await turnosServicio.reservar({ fecha: fechaISO, hora: horaSeleccionada, ...datos });
      toast.success('Turno reservado con éxito');
      setHoraSeleccionada(null);
      await recargar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo reservar el turno');
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold">Reservar turno</h1>

      <Calendar
        mode="single"
        selected={fecha}
        onSelect={(fechaElegida) => fechaElegida && setFecha(fechaElegida)}
        disabled={{ before: new Date() }}
        className="mx-auto"
      />

      <GrillaHorarios
        slots={slots}
        cargando={cargando}
        horaSeleccionada={horaSeleccionada}
        onSeleccionar={setHoraSeleccionada}
      />

      <FormularioReserva
        abierto={!!horaSeleccionada}
        fecha={fechaISO}
        hora={horaSeleccionada}
        nombreSugerido={perfil?.nombre_completo}
        telefonoSugerido={perfil?.telefono}
        onCerrar={() => setHoraSeleccionada(null)}
        onConfirmar={handleConfirmar}
      />
    </div>
  );
}