const CACHE_NAME = "nura-v1";

// Assets fundamentais para o Shell da aplicação
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.ico"
];

// Instalação do SW e pré-cache dos recursos estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação do SW e limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Estratégia de Fetch: Stale-While-Revalidate para requisições GET
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Atualiza o cache assincronamente em background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {});

        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});

// ==========================================
// MÓDULO DE NOTIFICAÇÕES LOCAIS (US11)
// ==========================================

// Escuta por mensagens vindas da aplicação principal (Client -> Service Worker)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_MEDICATION_ALERT') {
    const { medicationName, dosage, profileName } = event.data;

    const title = `Hora do Remédio: ${medicationName} 💊`;
    const options = {
      body: `${profileName} precisa tomar ${dosage}. Toque para abrir o Nura.`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `medication-${Date.now()}`,
      requireInteraction: true,
      data: { medicationName, profileName }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Manipulador de clique na notificação (Foca no app aberto ou abre nova janela)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});