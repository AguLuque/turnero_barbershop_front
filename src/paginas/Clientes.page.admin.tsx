import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientes } from '../hooks/useClientes.Admin';
import { TarjetaCliente } from '../components/turnos/infoCliente.admin';
import type { ClienteAdmin } from '../types/dominio.types';

const MINIMO_CARACTERES_BUSQUEDA = 3;

export function Clientes() {
  const { clientes, cargando } = useClientes();
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.trim();
    if (texto.length < MINIMO_CARACTERES_BUSQUEDA) return clientes;
    return clientes.filter((c) => c.nombre.toLowerCase().includes(texto.toLowerCase()));
  }, [clientes, busqueda]);

  function handleVerHistorial(cliente: ClienteAdmin) {
    navigate('/admin/clientes/historial', { state: { cliente } });
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Clientes</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={`Buscar cliente (mín. ${MINIMO_CARACTERES_BUSQUEDA} letras)...`}
          className="pl-9"
        />
      </div>

      {cargando ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {busqueda.trim().length >= MINIMO_CARACTERES_BUSQUEDA
            ? 'No se encontraron clientes con ese nombre'
            : 'Todavía no hay clientes registrados'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {clientesFiltrados.map((cliente, index) => (
            <div
              key={cliente.id}
              onClick={() => handleVerHistorial(cliente)}
              className="cursor-pointer"
            >
              <TarjetaCliente
                cliente={cliente}
                posicion={index + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}