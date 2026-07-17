import { NavLink } from 'react-router-dom';
import { CalendarClock, Repeat, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

const items = [
  { to: '/admin', label: 'Turnos', icono: CalendarClock, disponible: true },
  { to: '/admin/fijos', label: 'Fijos', icono: Repeat, disponible: true },
  { to: '/admin/horarios', label: 'Horarios', icono: Clock, disponible: true },
  { to: '/admin/clientes', label: 'Clientes', icono: Users, disponible: true },
];

export function AdminBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t bg-background pb-[env(safe-area-inset-bottom)] pt-2">
      {items.map(({ to, label, icono: Icono, disponible }) =>
        disponible ? (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 pb-2 text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <Icono size={22} />
            {label}
          </NavLink>
        ) : (
          <button
            key={to}
            onClick={() => toast('Próximamente')}
            className="flex flex-col items-center gap-1 px-4 pb-2 text-xs text-muted-foreground/40"
          >
            <Icono size={22} />
            {label}
          </button>
        )
      )}
    </nav>
  );
}