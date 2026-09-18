"use client";

import { useState, useEffect } from "react";
import { Download, Bell, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export function OnboardingPwaCard() {
  const { isInstallable, isInstalled, installPwa } = usePwaInstall();
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>("default");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const requestNotifications = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
  };

  if (isInstalled && notificationStatus === "granted") return null;

  return (
    <div className="bg-nura-teal-50 border border-nura-teal-200 rounded-2xl p-4 space-y-3 mb-4 text-left">
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-nura-teal-900 uppercase tracking-wider">
          Configuração Recomendada para Alertas
        </h3>
        <p className="text-xs text-nura-teal-700">
          Para que o Nura avise nos horários certos mesmo em segundo plano, ative os recursos abaixo:
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {/* Notificação */}
        <div className="bg-white rounded-xl p-3 flex items-center justify-between border border-nura-teal-100 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-nura-teal-600" />
            <span className="text-xs font-semibold text-nura-slate-800">Permitir Notificações</span>
          </div>
          {notificationStatus === "granted" ? (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">Ativado <CheckCircle2 className="w-3.5 h-3.5" /></span>
          ) : (
            <Button
              onClick={requestNotifications}
              size="sm"
              className="h-8 text-xs bg-nura-teal-600 hover:bg-nura-teal-700 text-white font-semibold cursor-pointer rounded-lg"
            >
              Ativar
            </Button>
          )}
        </div>

        {/* PWA Install */}
        <div className="bg-white rounded-xl p-3 flex flex-col gap-2 border border-nura-teal-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-nura-teal-600" />
              <span className="text-xs font-semibold text-nura-slate-800">Instalar App no Telemóvel</span>
            </div>
            {isInstalled ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">Instalado <CheckCircle2 className="w-3.5 h-3.5" /></span>
            ) : isInstallable ? (
              <Button
                onClick={installPwa}
                size="sm"
                className="h-8 text-xs bg-nura-teal-600 hover:bg-nura-teal-700 text-white font-semibold cursor-pointer rounded-lg"
              >
                Instalar
              </Button>
            ) : (
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-xs text-nura-teal-700 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Como instalar?
              </button>
            )}
          </div>

          {/* Instrução amigável caso não esteja no modo instalável direto */}
          {!isInstalled && !isInstallable && showHelp && (
            <div className="bg-nura-slate-50 p-2.5 rounded-lg text-[11px] text-nura-slate-600 space-y-1 border border-nura-slate-200">
              <p className="font-semibold text-nura-slate-800">No telemóvel (Android / Chrome):</p>
              <p>1. Toque no menu de três pontos (<strong className="text-nura-teal-700">⋮</strong>) no canto superior direito do navegador.</p>
              <p>2. Selecione <strong>&quot;Adicionar à tela inicial&quot;</strong> ou <strong>&quot;Instalar aplicativo&quot;</strong>.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}