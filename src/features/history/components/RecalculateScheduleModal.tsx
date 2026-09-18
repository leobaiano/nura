"use client";

import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecalculateScheduleModalProps {
  isOpen: boolean;
  medicationName: string;
  onAcceptRecalculate: () => void;
  onSkipRecalculate: () => void;
}

export function RecalculateScheduleModal({
  isOpen,
  medicationName,
  onAcceptRecalculate,
  onSkipRecalculate,
}: RecalculateScheduleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-xl border border-nura-slate-100 relative">
        <div className="w-12 h-12 rounded-2xl bg-nura-teal-100 text-nura-teal-700 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="font-display text-xl font-bold text-nura-slate-900">
            Recalcular Próximos Horários?
          </h3>
          <p className="text-sm text-nura-slate-600 leading-relaxed">
            Esta dose de <strong>{medicationName}</strong> foi confirmada com atraso. Deseja
            recalcular automaticamente os próximos horários do dia com base nesta nova tomada?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onSkipRecalculate}
            className="flex-1 h-11 rounded-xl text-sm font-semibold border-nura-slate-200 text-nura-slate-700 hover:bg-nura-slate-50 cursor-pointer"
          >
            Não, manter agenda
          </Button>
          <Button
            onClick={onAcceptRecalculate}
            className="flex-1 h-11 rounded-xl text-sm font-semibold bg-nura-teal-600 hover:bg-nura-teal-700 text-white shadow-xs cursor-pointer"
          >
            Sim, Recalcular
          </Button>
        </div>
      </div>
    </div>
  );
}