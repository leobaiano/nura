export const notificationService = {
  // Verifica se o navegador suporta notificações
  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
  },

  // Retorna o status atual da permissão ("granted", "denied", "default")
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  },

  // Solicita permissão ao usuário
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Erro ao solicitar permissão de notificação:", error);
      return false;
    }
  },

  // Envia uma notificação de teste imediata (para validar se o sistema funciona)
  async sendTestNotification(title: string, body: string): Promise<void> {
    if (!this.isSupported()) return;

    if (Notification.permission === "granted") {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: "/icon.png", // TODO: Criar icon
        badge: "/icon.png",
        tag: "nura-test-notification",
      });
    }
  }
};