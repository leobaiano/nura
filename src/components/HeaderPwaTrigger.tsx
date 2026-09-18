"use client";

import { useState, useEffect } from "react";
import { Bell, Smartphone, Check, HelpCircle } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export function HeaderPwaTrigger() {
  const { isInstallable, isInstalled, installPwa } = usePwaInstall();
  const [hasPermission, setHasPermission] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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

  const allGood = isInstalled && hasPermission;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
          allGood
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 animate-pulse"
        }`}
        title="Status do PWA e Notificações"
      >
        {allGood ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">PWA Ativo</span>
          </>
        ) : (
          <>
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Ativar Alertas</span>
          </>
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
              <span className="text-nura-slate-600 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-nura-teal-600" /> Notificações
              </span>
              {hasPermission ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">Permitidas <Check className="w-3 h-3" /></span>
              ) : (
                <button
                  onClick={handleRequestNotification}
                  className="text-nura-teal-600 font-semibold underline cursor-pointer bg-nura-teal-50 px-2 py-1 rounded-lg"
                >
                  Permitir agora
                </button>
              )}
            </div>

            {/* PWA Instalado */}
            <div className="flex flex-col gap-2 py-1 border-t border-nura-slate-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-nura-slate-600 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-nura-teal-600" /> PWA Instalado
                </span>
                {isInstalled ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">Sim <Check className="w-3 h-3" /></span>
                ) : isInstallable ? (
                  <button
                    onClick={installPwa}
                    className="text-nura-teal-600 font-semibold underline cursor-pointer bg-nura-teal-50 px-2 py-1 rounded-lg"
                  >
                    Instalar app
                  </button>
                ) : (
                  <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-nura-teal-700 font-semibold underline flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Como instalar?
                  </button>
                )}
              </div>

              {/* Caixa de Ajuda Expansível */}
              {!isInstalled && !isInstallable && showHelp && (
                <div className="bg-nura-slate-50 p-2.5 rounded-xl text-[11px] text-nura-slate-600 space-y-1 border border-nura-slate-200">
                  <p className="font-semibold text-nura-slate-800">No telemóvel (Android / Chrome):</p>
                  <p>1. Toque no menu de três pontos (<strong className="text-nura-teal-700">⋮</strong>) no canto superior direito.</p>
                  <p>2. Selecione <strong>&quot;Adicionar à tela inicial&quot;</strong> ou <strong>&quot;Instalar aplicativo&quot;</strong>.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}