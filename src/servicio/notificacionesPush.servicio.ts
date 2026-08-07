import { apiFetch } from './api';
import { API_ROUTES } from '../config/api.routes';

// Conversion estandar de la VAPID public key (base64 URL-safe) al formato
// Uint8Array que pide PushManager.subscribe.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function soportaNotificacionesPush(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function suscribirseANotificaciones(): Promise<void> {
  if (!soportaNotificacionesPush()) {
    throw new Error('Tu navegador no soporta notificaciones');
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') {
    throw new Error('No diste permiso para las notificaciones');
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
  });

  const sub = subscription.toJSON();
  if (!sub.endpoint || !sub.keys) {
    throw new Error('No se pudo generar la suscripción de notificaciones');
  }

  await apiFetch(API_ROUTES.notificaciones.suscribir, {
    metodo: 'POST',
    cuerpo: { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  });
}
