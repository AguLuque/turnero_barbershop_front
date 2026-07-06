import { NavLink } from 'react-router-dom';
import { CalendarDays, User, ListChecks } from 'lucide-react';

const items = [
  { to: '/', label: 'Inicio', icono: CalendarDays },
  { to: '/mis-turnos', label: 'Mis Turnos', icono: ListChecks },
  { to: '/perfil', label: 'Perfil', icono: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t bg-background pb-[env(safe-area-inset-bottom)] pt-2">
      {items.map(({ to, label, icono: Icono }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 pb-2 text-xs ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`
          }
        >
          <Icono size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}