"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, PackageCheck, Clock, ArrowRight, Download } from "lucide-react";

interface OnboardingScreenProps {
  onComplete: (name: string) => Promise<number | void>;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      console.log("O prompt nativo de instalação ainda não está disponível no navegador.");
      return;
    }

    // Dispara a janela NATIVA oficial do navegador/sistema operacional
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onComplete(userName.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-linear-to-b from-nura-teal-100/70 via-nura-slate-50 to-nura-slate-100 flex flex-col justify-center items-center p-5 md:p-10 font-sans overflow-hidden">
      {/* Círculos decorativos de luz ao fundo */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-nura-teal-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-nura-teal-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg space-y-6 md:space-y-8 z-10">
        {/* Header Centralizado */}
        <div className="text-center space-y-3">
          {!isInstalled && (
            <div className="flex justify-center mb-1">
              <Button
                onClick={handleInstallApp}
                variant="outline"
                className="h-16 px-5 bg-white/95 hover:bg-nura-teal-50 border-nura-teal-600/30 text-nura-teal-700 flex flex-col items-center justify-center gap-1 rounded-2xl shadow-xs transition-all cursor-pointer"
                title="Instalar aplicativo Nura"
              >
                <Download className="w-5 h-5 text-nura-teal-600" />
                <span className="text-xs font-semibold tracking-tight">
                  Instalar aplicativo
                </span>
              </Button>
            </div>
          )}

          <h1 className="font-display text-3xl md:text-4xl font-bold text-nura-slate-900 tracking-tight">
            Bem-vindo ao <span className="text-nura-teal-600">Nura</span>
          </h1>

          <p className="text-nura-slate-700 text-base md:text-lg leading-relaxed max-w-md mx-auto font-medium">
            Organize seus remédios, acompanhe as doses diárias e controle o estoque da sua família — sem depender de internet e com privacidade total.
          </p>
        </div>

        {/* Card Principal: Criar Perfil */}
        <Card className="border-nura-teal-600/20 shadow-xl bg-white/95 backdrop-blur-xs rounded-2xl">
          <CardHeader className="space-y-1.5 pb-3">
            <CardTitle className="font-display text-xl md:text-2xl text-nura-slate-900">
              Criar perfil inicial
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-nura-slate-600">
              Qual é o seu nome ou como quer identificar este primeiro perfil?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Ex: Carlos, Maria, Papai..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="h-12 font-sans text-base md:text-lg focus-visible:ring-nura-teal-600 border-nura-slate-300"
                  autoFocus
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={!userName.trim() || isSubmitting}
                className="w-full h-12 bg-nura-teal-600 hover:bg-nura-teal-700 text-white font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer rounded-xl"
              >
                {isSubmitting ? (
                  "Criando seu perfil..."
                ) : (
                  <>
                    Começar a Organizar <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Pilares de Utilidade Prática */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 bg-white/90 rounded-2xl border border-nura-slate-600/10 space-y-1.5 shadow-xs">
            <Clock className="w-5 h-5 text-nura-teal-600" />
            <p className="text-sm font-bold text-nura-slate-900">Rotina sem Erros</p>
            <p className="text-xs md:text-sm text-nura-slate-600 leading-normal">
              Registre o horário das doses tomadas ou atrasadas com 1 clique.
            </p>
          </div>

          <div className="p-4 bg-white/90 rounded-2xl border border-nura-slate-600/10 space-y-1.5 shadow-xs">
            <PackageCheck className="w-5 h-5 text-nura-teal-600" />
            <p className="text-sm font-bold text-nura-slate-900">Alerta de Estoque</p>
            <p className="text-xs md:text-sm text-nura-slate-600 leading-normal">
              Saiba exatamente quando os comprimidos estão acabando para repor.
            </p>
          </div>

          <div className="p-4 bg-white/90 rounded-2xl border border-nura-slate-600/10 space-y-1.5 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-nura-teal-600" />
            <p className="text-sm font-bold text-nura-slate-900">Privacidade Total</p>
            <p className="text-xs md:text-sm text-nura-slate-600 leading-normal">
              Seus dados de saúde ficam salvos apenas no seu dispositivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}