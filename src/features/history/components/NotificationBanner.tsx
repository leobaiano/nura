"use client";

import { useState, useEffect } from "react";
import { notificationService } from "@/lib/notificationService";
import { Button } from "@/components/ui/button";
import { Bell, BellRing, CheckCircle2 } from "lucide-react";

export function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(notificationService.isSupported());
    setPermission(notificationService.getPermissionStatus());
  }, []);

  const handleEnable = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(granted ? "granted" : "denied");

    if (granted) {
      await notificationService.sendTestNotification(
        "Nura - Alertas Ativados! 💊",
        "Agora você receberá avisos nos horários certos dos seus medicamentos."
      );
    }
  };

  if (!supported || permission === "granted") {
    return null; // Não exibe se não for suportado ou se já estiver concedido
  }

  return (
    <div className="bg-nura-teal-50 border border-nura-teal-200 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-nura-teal-600 text-white rounded-xl shadow-xs">
          <Bell className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="font-display font-bold text-xs sm:text-sm text-nura-teal-900">
            Ativar Alertas de Medicamentos
          </h4>
          <p className="text-xs text-nura-teal-700 leading-relaxed">
            Permita notificações para ser lembrado no horário exato de tomar os remédios.
          </p>
        </div>
      </div>

      <Button
        onClick={handleEnable}
        className="bg-nura-teal-600 hover:bg-nura-teal-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shrink-0 cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
      >
        <BellRing className="w-3.5 h-3.5" />
        <span>Ativar Agora</span>
      </Button>
    </div>
  );
}