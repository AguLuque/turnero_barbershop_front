// Genera los horarios individuales dentro de una lista de franjas horarias,
// respetando la duracion de turno configurada (los mismos horarios que ve
// un cliente en la grilla de reservar turno).
export function generarHorariosDeFranjas(
  franjas: { hora_inicio: string; hora_fin: string }[],
  duracionMinutos: number
): string[] {
  const horarios: string[] = [];
  for (const franja of franjas) {
    const [hIni, mIni] = franja.hora_inicio.slice(0, 5).split(':').map(Number);
    const [hFin, mFin] = franja.hora_fin.slice(0, 5).split(':').map(Number);
    let minutos = hIni * 60 + mIni;
    const minutosFin = hFin * 60 + mFin;
    while (minutos < minutosFin) {
      const h = Math.floor(minutos / 60).toString().padStart(2, '0');
      const m = (minutos % 60).toString().padStart(2, '0');
      horarios.push(`${h}:${m}`);
      minutos += duracionMinutos;
    }
  }
  return horarios;
}
