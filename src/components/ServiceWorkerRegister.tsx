"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        // Verifica se já há um worker em espera ao carregar
        if (registration.waiting) {
          triggerUpdate(registration.waiting);
        }

        // Monitora se um novo worker foi encontrado e instalado
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  // Novo conteúdo disponível, força a ativação e reload
                  triggerUpdate(installingWorker);
                }
              }
            };
          }
        };
      });

      // Garante que se o controlador mudar, a página recarrega com a versão nova
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  return null;
}

function triggerUpdate(worker: ServiceWorker) {
  // Envia comando para o SW pular a espera e assumir o controle
  worker.postMessage({ type: "SKIP_WAITING" });
}