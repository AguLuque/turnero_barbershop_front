export function fechaAISO(fecha: Date): string {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

export function esHoy(fechaISO: string): boolean {
  return fechaISO === fechaAISO(new Date());
}

export function turnoYaOcurrio(fechaISO: string, hora: string): boolean {
  return new Date(`${fechaISO}T${hora}`).getTime() < Date.now();
}

export function formatearFechaLegible(fechaISO: string): string {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  return fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatearHora(hora: string): string {
  return hora.slice(0, 5);
}