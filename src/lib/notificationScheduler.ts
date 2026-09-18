import { db } from "@/lib/db";

export const notificationScheduler = {
  // Inicia o motor de verificação periódica
  initScheduler() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Roda a verificação a cada 30 segundos
    setInterval(async () => {
      if (Notification.permission !== "granted") return;

      try {
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, "0");
        const currentMinutes = String(now.getMinutes()).padStart(2, "0");
        const currentTimeStr = `${currentHours}:${currentMinutes}`;

        // Busca medicamentos e perfis no IndexedDB
        const medications = await db.medications.toArray();
        const profiles = await db.profiles.toArray();

        for (const med of medications) {
          const profile = profiles.find((p) => p.id === med.profileId);
          const profileName = profile ? profile.name : "Paciente";

          // Aqui cruzamos o horário atual com os horários programados do medicamento.
          // (Para fins de teste da US11, podemos verificar se o horário bate ou disparar via ação manual)
        }
      } catch (error) {
        console.error("Erro ao verificar agendamentos de medicamentos:", error);
      }
    }, 30000);
  },

  // Função utilitária para disparar um alerta imediato via Service Worker (ideal para testes da US11)
  async triggerTestAlert(medicationName: string, dosage: string, profileName: string) {
    if (typeof window === "undefined") return;

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_MEDICATION_ALERT',
        medicationName,
        dosage,
        profileName
      });
    } else {
      // Fallback direto caso o controller do SW ainda esteja a aquecer
      const registration = await navigator.serviceWorker?.ready;
      if (registration) {
        registration.showNotification(`Hora do Remédio: ${medicationName} 💊`, {
          body: `${profileName} precisa tomar ${dosage}. Toque para abrir o Nura.`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `medication-test-${Date.now()}`,
          data: { medicationName, profileName }
        });
      }
    }
  }
};