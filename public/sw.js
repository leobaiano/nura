const CACHE_NAME = "nura-v1";

// Assets fundamentais para o Shell da aplicação
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.ico"
];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

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
// MÓDULO DE NOTIFICAÇÕES & QUICK ACTIONS (US11 & US12)
// ==========================================

function openNuraDB() {
  return new Promise((resolve, reject) => {
    // Sem informar a versão, o IndexedDB abre a versão
    // atualmente existente no navegador.
    const request = indexedDB.open("NuraDB");

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;

      db.onversionchange = () => {
        db.close();
      };

      resolve(db);
    };
  });
}

// Escuta por mensagens vindas da aplicação principal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_MEDICATION_ALERT') {
    const { medicationId, medicationName, dosage, profileId, profileName } = event.data;

    const title = `Hora do Remédio: ${medicationName} 💊`;
    const options = {
      body: `${profileName} precisa tomar ${dosage}.`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `medication-${medicationId}-${Date.now()}`,
      requireInteraction: true,
      data: { medicationId, medicationName, dosage, profileId, profileName },
      actions: [
        { action: 'confirm-dose', title: '✅ Confirmar' },
        { action: 'snooze-dose', title: '⏰ Adiar 15 min' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Manipulador de clique na notificação e Quick Actions (US12)
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  // Ação [Confirmar]: Abate estoque e grava em doseLogs no IndexedDB em background
  if (action === 'confirm-dose') {
    event.waitUntil(
      (async () => {
        try {
          const db = await openNuraDB();
          
          // 1. Atualizar estoque na tabela 'stocks'
          await new Promise((resolve, reject) => {
            const transaction = db.transaction(["stocks"], "readwrite");
            const store = transaction.objectStore("stocks");
            
            const getRequest = store.get(data.medicationId);

            getRequest.onsuccess = () => {
              let stockItem = getRequest.result;
              
              if (!stockItem) {
                try {
                  const index = store.index("medicationId");
                  const idxRequest = index.get(data.medicationId);
                  idxRequest.onsuccess = () => {
                    const found = idxRequest.result;
                    if (found) {
                      found.currentQuantity = Math.max(0, found.currentQuantity - 1);
                      found.updatedAt = new Date();
                      store.put(found);
                    }
                    resolve(true);
                  };
                  idxRequest.onerror = () => resolve(true);
                  return;
                } catch (e) {
                  // Sem índice secundário, prossegue
                }
              }

              if (stockItem) {
                stockItem.currentQuantity = Math.max(0, stockItem.currentQuantity - 1);
                stockItem.updatedAt = new Date();
                store.put(stockItem);
              }
              resolve(true);
            };
            getRequest.onerror = () => reject(getRequest.error);
          });

          // 2. Registar tomada na tabela 'doseLogs'
          await new Promise((resolve, reject) => {
            const transaction = db.transaction(["doseLogs"], "readwrite");
            const store = transaction.objectStore("doseLogs");
            
            const logEntry = {
              medicationId: data.medicationId,
              profileId: data.profileId || 1,
              scheduledTime: new Date(),
              takenAt: new Date(),
              status: "taken",
              notes: "Confirmado via Quick Action (Notificação)",
              createdAt: new Date()
            };

            const addRequest = store.add(logEntry);
            addRequest.onsuccess = () => resolve(true);
            addRequest.onerror = () => reject(addRequest.error);
          });

          // Exibe feedback visual de sucesso
          await self.registration.showNotification("Dose Confirmada! ✅", {
            body: `A toma de ${data.medicationName || 'medicamento'} foi registrada e o estoque atualizado.`,
            icon: '/icon-192.png',
            tag: 'confirmation-success'
          });
        } catch (err) {
          console.error("Erro ao processar confirmação em background no SW:", err);
        }
      })()
    );
    return;
  }

  // Ação [Adiar 15 min]: Reprograma o alarme
  if (action === 'snooze-dose') {
    event.waitUntil(
      (async () => {
        setTimeout(async () => {
          await self.registration.showNotification(`Lembrete Adiado: ${data.medicationName || 'Remédio'} ⏰`, {
            body: `${data.profileName || 'Paciente'} precisa tomar ${data.dosage || ''} (adiado).`,
            icon: '/icon-192.png',
            tag: `snooze-${data.medicationId}-${Date.now()}`,
            requireInteraction: true,
            data,
            actions: [
              { action: 'confirm-dose', title: '✅ Confirmar' },
              { action: 'snooze-dose', title: '⏰ Adiar 15 min' }
            ]
          });
        }, 15 * 60 * 1000); // 15 minutos
      })()
    );
    return;
  }

  // Comportamento padrão ao clicar no corpo da notificação (abre o app)
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