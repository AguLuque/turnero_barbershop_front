import { Outlet } from 'react-router-dom';
import { Header } from './header';
import { AdminBottomNav } from './adminBottomNav';

export function LayoutAdmin() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <AdminBottomNav />
    </div>
  );
}