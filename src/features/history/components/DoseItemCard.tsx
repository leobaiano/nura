"use client";

import { Medication } from "@/features/medications/types";
import { DoseLog } from "@/features/history/types";
import { Button } from "@/components/ui/button";
import { Check, Clock, Pill, AlertCircle, Plus, Lock } from "lucide-react";

interface DoseItemCardProps {
  medication: Medication;
  log?: DoseLog;
  scheduledTime?: string;
  scheduledDateTime?: Date;
  onRecordDose: (
    medicationId: number,
    status: "taken" | "skipped" | "late"
  ) => Promise<void>;
}

// Tolerância em minutos para permitir tomar adiantado (ex: 15 minutos)
const ADVANCE_TOLERANCE_MINUTES = 15;

export function DoseItemCard({
  medication,
  log,
  scheduledTime,
  scheduledDateTime,
  onRecordDose,
}: DoseItemCardProps) {
  const isAsNeeded =
    medication.scheduleType === "as_needed" || !medication.scheduleType;

  const isTaken = !isAsNeeded && (log?.status === "taken" || log?.status === "late");

  const now = new Date();
  
  // Identifica se a dose está atrasada
  const isOverdue =
    !isAsNeeded &&
    !isTaken &&
    scheduledDateTime !== undefined &&
    scheduledDateTime.getTime() < now.getTime();

  // Identifica se é uma dose futura além da janela de tolerância
  const isFuture =
    !isAsNeeded &&
    !isTaken &&
    scheduledDateTime !== undefined &&
    scheduledDateTime.getTime() - now.getTime() > ADVANCE_TOLERANCE_MINUTES * 60 * 1000;

  const handleTakeDose = async () => {
    if (medication.id !== undefined && (!isTaken || isAsNeeded) && !isFuture) {
      const statusToRecord = isOverdue ? "late" : "taken";
      await onRecordDose(medication.id, statusToRecord);
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all shadow-2xs flex items-center justify-between gap-3 ${
        isOverdue
          ? "bg-amber-50/60 border-amber-300"
          : isFuture
          ? "bg-nura-slate-50/50 border-nura-slate-200/60 opacity-80"
          : "bg-white border-nura-slate-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl shrink-0 ${
            isTaken
              ? "bg-emerald-100 text-emerald-600"
              : isOverdue
              ? "bg-amber-100 text-amber-700"
              : isFuture
              ? "bg-nura-slate-200/60 text-nura-slate-500"
              : "bg-nura-teal-100 text-nura-teal-600"
          }`}
        >
          <Pill className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm sm:text-base text-nura-slate-900 leading-tight">
              {medication.name}
            </p>

            {/* Badge de Horário ou Sob Demanda */}
            {scheduledTime ? (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  isOverdue
                    ? "bg-amber-200 text-amber-900"
                    : isFuture
                    ? "bg-nura-slate-200/70 text-nura-slate-600"
                    : "bg-nura-slate-100 text-nura-slate-700"
                }`}
              >
                <Clock className="w-3 h-3" />
                {scheduledTime}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-nura-slate-100 text-nura-slate-700">
                Sob Demanda
              </span>
            )}

            {isOverdue && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded-md">
                <AlertCircle className="w-3 h-3" />
                Atrasado
              </span>
            )}
          </div>

          <p className="text-xs text-nura-slate-600">
            {medication.dosage} {medication.unit}
            {medication.instructions && ` • ${medication.instructions}`}
          </p>
        </div>
      </div>

      {/* Botão de Ação Rápida */}
      <Button
        onClick={handleTakeDose}
        disabled={isTaken || isFuture}
        variant={isTaken || isFuture ? "outline" : "default"}
        className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
          isTaken
            ? "bg-emerald-50 border-emerald-300 text-emerald-700 opacity-90"
            : isFuture
            ? "bg-nura-slate-100 border-nura-slate-200 text-nura-slate-400 cursor-not-allowed"
            : isOverdue
            ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
            : "bg-nura-teal-600 hover:bg-nura-teal-700 text-white shadow-xs cursor-pointer"
        }`}
      >
        {isTaken ? (
          <>
            <Check className="w-4 h-4 mr-1 text-emerald-600" />
            Tomado
          </>
        ) : isFuture ? (
          <>
            <Lock className="w-3.5 h-3.5 mr-1 text-nura-slate-400" />
            Aguardando
          </>
        ) : isAsNeeded ? (
          <>
            <Plus className="w-4 h-4 mr-1" />
            Tomar Dose
          </>
        ) : (
          "Tomar Dose"
        )}
      </Button>
    </div>
  );
}