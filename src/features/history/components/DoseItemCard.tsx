"use client";

import { Medication } from "@/features/medications/types";
import { DoseLog } from "@/features/history/types";
import { Button } from "@/components/ui/button";
import { Check, Clock, Pill, AlertCircle } from "lucide-react";

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

export function DoseItemCard({
  medication,
  log,
  scheduledTime,
  scheduledDateTime,
  onRecordDose,
}: DoseItemCardProps) {
  const isTaken = log?.status === "taken" || log?.status === "late";

  // Identifica se a dose agendada está atrasada
  const now = new Date();
  const isOverdue =
    !isTaken &&
    scheduledDateTime !== undefined &&
    scheduledDateTime.getTime() < now.getTime();

  const handleTakeDose = async () => {
    if (medication.id !== undefined && !isTaken) {
      // Se estiver no horário após o previsto, registra com o status de atrasado
      const statusToRecord = isOverdue ? "late" : "taken";
      await onRecordDose(medication.id, statusToRecord);
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all shadow-2xs flex items-center justify-between gap-3 ${
        isOverdue
          ? "bg-amber-50/60 border-amber-300"
          : "bg-white border-nura-slate-200"
      }`}
    >
      {/* Informações do Medicamento */}
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl shrink-0 ${
            isTaken
              ? "bg-emerald-100 text-emerald-600"
              : isOverdue
              ? "bg-amber-100 text-amber-700"
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
                    : "bg-nura-slate-100 text-nura-slate-700"
                }`}
              >
                <Clock className="w-3 h-3" />
                {scheduledTime}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-nura-slate-100 text-nura-slate-600">
                Sob Demanda
              </span>
            )}

            {/* Tag de Atrasado */}
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
        disabled={isTaken}
        variant={isTaken ? "outline" : "default"}
        className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
          isTaken
            ? "bg-emerald-50 border-emerald-300 text-emerald-700 opacity-90"
            : isOverdue
            ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            : "bg-nura-teal-600 hover:bg-nura-teal-700 text-white shadow-xs"
        }`}
      >
        {isTaken ? (
          <>
            <Check className="w-4 h-4 mr-1 text-emerald-600" />
            Tomado
          </>
        ) : (
          "Tomar Dose"
        )}
      </Button>
    </div>
  );
}