import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function LayoutPrincipal() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}