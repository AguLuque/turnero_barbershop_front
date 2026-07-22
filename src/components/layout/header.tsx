import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { cerrarSesion } = useAuth();

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <img src="/Logo.png" alt="Barber Cache" className="h-8 w-8 rounded-full object-cover" />
        <span className="font-semibold">Turnero Barbershop</span>
      </div>
      <Button variant="ghost" size="icon" onClick={cerrarSesion} aria-label="Cerrar sesión">
        <LogOut size={20} />
      </Button>
    </header>
  );
}