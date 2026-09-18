import { db } from "@/lib/db";

export const notificationScheduler = {
  // Inicia o motor de verificação periódica (roda a cada 30 segundos)
  initScheduler() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Evita duplicações de interval caso o hook recarregue
    if ((window as any).__nura_scheduler_active) return;
    (window as any).__nura_scheduler_active = true;

    setInterval(async () => {
      if (Notification.permission !== "granted") return;

      try {
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, "0");
        const currentMinutes = String(now.getMinutes()).padStart(2, "0");
        const currentTimeStr = `${currentHours}:${currentMinutes}`;

        // Busca todos os medicamentos e perfis gravados no IndexedDB (Dexie)
        const medications = await db.medications.toArray();
        const profiles = await db.profiles.toArray();

        for (const med of medications) {
          const profile = profiles.find((p) => p.id === med.profileId);
          const profileName = profile ? profile.name : "Paciente";

          // Utiliza a propriedade correta 'specificTimes' definida na interface Medication
          const scheduledTimes = med.specificTimes || [];
          
          if (scheduledTimes.includes(currentTimeStr)) {
            // Envia a mensagem para o Service Worker disparar o alerta nativo
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_MEDICATION_ALERT',
                medicationId: med.id,
                medicationName: med.name,
                dosage: `${med.dosage} ${med.unit || ''}`,
                profileName
              });
            }
          }
        }
      } catch (error) {
        console.error("Erro no motor de agendamento de notificações:", error);
      }
    }, 30000); // 30 segundos
  },

  // Função utilitária para disparar um teste manual imediato validando a US11 e US12
  async triggerTestAlert(medicationName: string, dosage: string, profileName: string, medicationId: number = 1) {
    if (typeof window === "undefined") return;

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_MEDICATION_ALERT',
        medicationId,
        medicationName,
        dosage,
        profileName
      });
    } else {
      const registration = await navigator.serviceWorker?.ready;
      if (registration) {
        // Casting para 'any' para evitar conflitos estritos do NotificationOptions com actions do SW
        const options: any = {
          body: `${profileName} precisa tomar ${dosage}. Toque para abrir ou escolha uma ação rápida.`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `medication-test-${Date.now()}`,
          data: { medicationId, medicationName, dosage, profileName },
          actions: [
            { action: 'confirm-dose', title: '✅ Confirmar' },
            { action: 'snooze-dose', title: '⏰ Adiar 15 min' }
          ]
        };

        registration.showNotification(`Hora do Remédio: ${medicationName} 💊`, options);
      }
    }
  }
};