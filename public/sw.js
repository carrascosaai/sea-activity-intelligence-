// Service worker mínimo, solo para notificaciones push ("avísame cuando
// haya buenas condiciones", ver AlertButton.tsx). No cachea nada ni hace
// la app funcionar offline — eso sería un cambio de comportamiento mucho
// mayor (y no es lo que se ha pedido), este archivo existe únicamente
// porque el navegador exige un service worker activo para poder recibir
// eventos push en segundo plano.

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/pwa-icon?size=192",
      badge: "/pwa-icon?size=192",
      data: { url: payload.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
