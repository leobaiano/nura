"use client";

import { AlertTriangle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AntiOverdoseModalProps {
  isOpen: boolean;
  medicationName: string;
  lastTakenTime: Date;
  minutesAgo: number;
  onConfirmOverride: () => void;
  onCancel: () => void;
}

export function AntiOverdoseModal({
  isOpen,
  medicationName,
  lastTakenTime,
  minutesAgo,
  onConfirmOverride,
  onCancel,
}: AntiOverdoseModalProps) {
  if (!isOpen) return null;

  const timeFormatted = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(lastTakenTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-xl border border-red-100 relative">
        {/* Botão de Fechar */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 text-nura-slate-400 hover:text-nura-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ícone de Alerta Vermelho */}
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Textos descritivos */}
        <div className="text-center space-y-2">
          <h3 className="font-display text-xl font-bold text-nura-slate-900">
            Atenção: Intervalo Curto!
          </h3>
          <p className="text-sm text-nura-slate-600 leading-relaxed">
            Você registrou uma dose de <strong>{medicationName}</strong> há apenas{" "}
            <span className="text-red-600 font-semibold">{minutesAgo} minutos</span>{" "}
            (às {timeFormatted}). Tomar novamente em curto espaço de tempo pode
            apresentar riscos de superdosagem.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl text-sm font-semibold border-nura-slate-200 text-nura-slate-700 hover:bg-nura-slate-50 cursor-pointer"
          >
            Cancelar Tomada
          </Button>
          <Button
            onClick={onConfirmOverride}
            className="flex-1 h-11 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer"
          >
            Estou ciente, Tomar
          </Button>
        </div>
      </div>
    </div>
  );
}