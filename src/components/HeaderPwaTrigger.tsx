"use client";

import { useState, useEffect } from "react";
import { Bell, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { Button } from "@/components/ui/button";

export function HeaderPwaTrigger() {
  const { isInstallable, isInstalled, installPwa } = usePwaInstall();
  const [hasPermission, setHasPermission] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasPermission(Notification.permission === "granted");
    }
  }, []);

  const handleRequestNotification = async () => {
    if (!("Notification" in window)) return;
    const res = await Notification.requestPermission();
    setHasPermission(res === "granted");
  };

  // Cálculo de pendências
  const missingNotifications = !hasPermission;
  const missingInstall = !isInstalled;
  
  let pendingCount = 0;
  if (missingNotifications) pendingCount++;
  if (missingInstall) pendingCount++;

  const allGood = pendingCount === 0;

  // Determina a cor da badge de alerta no botão principal
  // 2 pendências (ou só notificação faltando) = Vermelho. Só instalação faltando = Amarelo.
  let badgeColor = "bg-rose-500 text-white";
  if (!missingNotifications && missingInstall) {
    badgeColor = "bg-amber-500 text-white";
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
          allGood
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 animate-pulse"
        }`}
        title="Status do PWA e Notificações"
      >
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <span className="hidden sm:inline font-semibold">
          {allGood ? "Tudo Ativo" : "Configurar Alertas"}
        </span>

        {/* Badge de contador inteligente */}
        {!allGood && (
          <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-md ${badgeColor}`}>
            {pendingCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-nura-slate-100 p-4 z-50 space-y-3">
          <div className="flex justify-between items-center border-b border-nura-slate-100 pb-2">
            <h4 className="font-semibold text-sm text-nura-slate-900">Estado do Aplicativo</h4>
            <button onClick={() => setIsOpen(false)} className="text-xs text-nura-slate-400 hover:text-nura-slate-600 cursor-pointer">
              ✕
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Notificações */}
            <div className="flex items-center justify-between py-1">
              <span className="text-nura-slate-600 flex items-center gap-1.5 font-medium">
                <Bell className="w-4 h-4 text-nura-teal-600" /> Notificações
              </span>
              {hasPermission ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">Permitidas <CheckCircle2 className="w-3.5 h-3.5" /></span>
              ) : (
                <Button
                  onClick={handleRequestNotification}
                  size="sm"
                  className="h-7 text-xs bg-nura-teal-600 hover:bg-nura-teal-700 text-white font-semibold cursor-pointer rounded-lg"
                >
                  Ativar
                </Button>
              )}
            </div>

            {/* Instalação */}
            <div className="flex items-center justify-between py-1 border-t border-nura-slate-100 pt-2">
              <span className="text-nura-slate-600 flex items-center gap-1.5 font-medium">
                <Smartphone className="w-4 h-4 text-nura-teal-600" /> Instalação
              </span>
              {isInstalled ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">Instalado <CheckCircle2 className="w-3.5 h-3.5" /></span>
              ) : (
                <Button
                  onClick={installPwa}
                  size="sm"
                  className="h-7 text-xs bg-nura-teal-600 hover:bg-nura-teal-700 text-white font-semibold cursor-pointer rounded-lg"
                >
                  Instalar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}