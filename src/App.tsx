import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RutaProtegida } from './config/rutaPortegida';
import { Login } from './paginas/Login.page';
import { Home } from './paginas/Home';
import { MisTurnos } from './paginas/MisTurnos.page';
import { Perfil } from './paginas/Perfil.page';
import { TurnosDelDia } from './paginas/turnosDia.page.admin';
import { TurnosFijos } from './paginas/TurnosFijos.admin';
import { LayoutPrincipal } from './components/layout/principal.layout';
import { LayoutAdmin } from './components/layout/layoutAdmin';
import { APP_ROUTES } from './config/appRoutes';
import { ROLES } from './config/roles.config';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={APP_ROUTES.auth.login} element={<Login />} />

        {/* Zona cliente: cualquier usuario logueado entra (Home decide si redirige a /admin) */}
        <Route
          element={
            <RutaProtegida>
              <LayoutPrincipal />
            </RutaProtegida>
          }
        >
          <Route path={APP_ROUTES.cliente.root} element={<Home />} />
          <Route path={APP_ROUTES.cliente.misTurnos} element={<MisTurnos />} />
          <Route path={APP_ROUTES.cliente.perfil} element={<Perfil />} />
        </Route>

        {/* Zona admin: solo admin y superadmin */}
        <Route
          element={
            <RutaProtegida allowedRoles={[ROLES.ADMIN, ROLES.SUPERADMIN]}>
              <LayoutAdmin />
            </RutaProtegida>
          }
        >
          <Route path={APP_ROUTES.admin.root} element={<TurnosDelDia />} />
          <Route path={APP_ROUTES.admin.turnosFijos} element={<TurnosFijos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}