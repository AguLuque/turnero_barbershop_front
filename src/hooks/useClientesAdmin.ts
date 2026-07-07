import { useEffect, useState } from 'react';
import { perfilesServicio } from '../servicio/perfiles.servicio';
import type { ClienteConRanking } from '../types/dominio.types';

export function useClientesAdmin() {
  const [clientes, setClientes] = useState<ClienteConRanking[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    perfilesServicio
      .adminListarClientes()
      .then(setClientes)
      .finally(() => setCargando(false));
  }, []);

  return { clientes, cargando };
}