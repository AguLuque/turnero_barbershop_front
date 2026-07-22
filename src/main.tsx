import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexto/authContext';
import { AppRouter } from './App';
import { Toaster } from '@/components/ui/sonner';
import { ActualizacionDisponible } from './components/ActualizacionDisponible';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
      <Toaster />
      <ActualizacionDisponible />
    </AuthProvider>
  </StrictMode>
);