import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../config/appRoutes';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
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
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const navigate = useNavigate();

  async function handleConfirmar(datos: { nombreCliente: string; telefonoCliente: string }) {
    if (!horaSeleccionada) return;
    try {
      await turnosServicio.reservar({ fecha: fechaISO, hora: horaSeleccionada, ...datos });
      toast.success('Turno reservado con éxito');
      setHoraSeleccionada(null);
      setMostrarFormulario(false);
      await recargar();
      navigate(APP_ROUTES.cliente.root);
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
        onSelect={(fechaElegida) => {
          if (!fechaElegida) return;
          setFecha(fechaElegida);
          setHoraSeleccionada(null);
        }}
        disabled={{ before: new Date() }}
        className="mx-auto"
      />

      <GrillaHorarios
        slots={slots}
        cargando={cargando}
        horaSeleccionada={horaSeleccionada}
        onSeleccionar={setHoraSeleccionada}
      />

      <Button
        size="lg"
        className="w-full"
        disabled={!horaSeleccionada}
        onClick={() => setMostrarFormulario(true)}
      >
        Guardar turno
      </Button>

      <FormularioReserva
        abierto={mostrarFormulario}
        fecha={fechaISO}
        hora={horaSeleccionada}
        nombreSugerido={perfil?.nombre_completo}
        telefonoSugerido={perfil?.telefono}
        onCerrar={() => {
          setMostrarFormulario(false);
          setHoraSeleccionada(null);
        }}
        onConfirmar={handleConfirmar}
      />
    </div>
  );
}