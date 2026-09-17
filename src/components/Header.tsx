"use client";

import { useState, useEffect } from "react";
import { Profile } from "@/features/profiles/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pill, WifiOff, User, Download } from "lucide-react";

interface HeaderProps {
  profiles: Profile[];
  selectedProfileId: number | null;
  onSelectProfile: (id: number) => void;
}

export function Header({
  profiles,
  selectedProfileId,
  onSelectProfile,
}: HeaderProps) {
  const [isOffline, setIsOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Monitora estado de conexão offline
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Monitora evento PWA e estado de instalação
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      console.log("Aguardando evento de instalação nativo do navegador.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-nura-slate-200 shadow-2xs px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        {/* Lado Esquerdo: Botão de Instalar (se não instalado) + Logo Nura */}
        <div className="flex items-center gap-2.5">
          {!isInstalled && (
            <Button
              onClick={handleInstallApp}
              variant="outline"
              size="sm"
              className="h-9 px-2.5 bg-nura-teal-50 hover:bg-nura-teal-100/80 border-nura-teal-600/30 text-nura-teal-700 flex items-center gap-1.5 rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
              title="Instalar o aplicativo no dispositivo"
            >
              <Download className="w-4 h-4 text-nura-teal-600" />
              <span className="text-xs font-semibold hidden sm:inline">
                Instalar app
              </span>
            </Button>
          )}

          <div className="flex items-center gap-2">
            <div className="p-2 bg-nura-teal-100 rounded-xl text-nura-teal-600">
              <Pill className="w-5 h-5 text-nura-teal-600" />
            </div>
            <span className="font-display font-bold text-xl text-nura-slate-900 tracking-tight">
              Nura
            </span>
          </div>
        </div>

        {/* Lado Direito: Badge Offline + Seletor de Perfil */}
        <div className="flex items-center gap-2">
          {/* Indicador de Status Offline */}
          {isOffline && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium animate-in fade-in duration-300"
              title="Você está navegando em modo offline. O app continua funcionando normalmente."
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* Seletor de Perfil do Familiar */}
          {profiles.length > 0 && selectedProfileId !== null && (
            <Select
              value={selectedProfileId.toString()}
              onValueChange={(value: string) => onSelectProfile(Number(value))}
            >
              <SelectTrigger className="h-9 w-36 sm:w-44 bg-nura-slate-50 border-nura-slate-200 text-nura-slate-800 font-medium text-xs sm:text-sm focus:ring-nura-teal-600 rounded-xl">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3.5 h-3.5 text-nura-teal-600 shrink-0" />
                  <SelectValue placeholder="Selecione..." />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl border-nura-slate-200">
                {profiles.map((profile) => {
                  if (profile.id === undefined) return null;
                  return (
                    <SelectItem
                      key={profile.id}
                      value={profile.id.toString()}
                      className="text-xs sm:text-sm cursor-pointer"
                    >
                      {profile.name} {profile.isDefault ? "(Eu)" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </header>
  );
}