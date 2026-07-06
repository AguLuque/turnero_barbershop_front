import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RutaProtegida } from './protected.rutas';
import { Login } from '../paginas/Login';
import { Inicio } from '../paginas/Inicio';
import { MisTurnos } from '../paginas/MisTurnos';
import { Perfil } from '../paginas/Perfil';
import { LayoutPrincipal } from '../components/layout/principal.layout';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RutaProtegida>
              <LayoutPrincipal />
            </RutaProtegida>
          }
        >
          <Route path="/" element={<Inicio />} />
          <Route path="/mis-turnos" element={<MisTurnos />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}