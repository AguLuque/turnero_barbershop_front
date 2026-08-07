self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      // Icono grande a color, se ve al expandir la notificación.
      icon: '/icon-192.png',
      // Android tiñe este ícono a monocromo sin importar qué imagen se le pase
      // (limitación de la plataforma, no un bug). Placeholder temporal hasta
      // generar public/badge-notificacion.png (silueta blanca 96x96 sobre
      // fondo transparente) y cambiar esta ruta.
      badge: '/badge-notificacion.png',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
