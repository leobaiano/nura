// Estende os tipos para suportar o padrão de vibração do Service Worker sem dar erro de TS
interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

export const notificationService = {
  /**
   * Verifica se o navegador suporta a API de Notificações
   */
  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  },

  /**
   * Solicita permissão ao usuário para exibir notificações locais
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return "denied";
    }

    if (Notification.permission === "default") {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  },

  /**
   * Retorna o status atual da permissão
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  },

  /**
   * Envia uma notificação local imediata ou via Service Worker
   */
  async sendLocalNotification(title: string, options?: ExtendedNotificationOptions) {
    if (!this.isSupported() || Notification.permission !== "granted") {
      return;
    }

    // Tenta enviar via Service Worker se estiver disponível
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            icon: "/icons/icon-192x192.png",
            badge: "/icons/icon-192x192.png",
            vibrate: [200, 100, 200],
            ...options,
          } as NotificationOptions);
          return;
        }
      } catch (err) {
        console.warn("Falha ao enviar notificação via Service Worker, usando fallback.", err);
      }
    }

    // Fallback para Notification API padrão
    new Notification(title, {
      icon: "/icons/icon-192x192.png",
      ...options,
    });
  },

  /**
   * Agenda lembretes locais para as doses programadas do dia
   */
  scheduleDoseReminder(medicationName: string, dosageInfo: string, scheduledDate: Date) {
    if (!this.isSupported() || Notification.permission !== "granted") return;

    const now = new Date().getTime();
    const targetTime = scheduledDate.getTime();
    const delay = targetTime - now;

    // Só agenda se o horário for no futuro (dentro do dia de hoje)
    if (delay > 0) {
      setTimeout(() => {
        this.sendLocalNotification(`Hora de tomar seu remédio: ${medicationName}`, {
          body: `Dosagem: ${dosageInfo}. Abra o Nura para registrar a dose.`,
          tag: `med-${medicationName}-${targetTime}`,
        });
      }, delay);
    }
  },
};