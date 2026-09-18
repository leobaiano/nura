"use client";

import { Medication } from "@/features/medications/types";
import { DoseLog } from "@/features/history/types";
import { Button } from "@/components/ui/button";
import { Check, Pill } from "lucide-react";

interface DoseItemCardProps {
  medication: Medication;
  log?: DoseLog;
  onRecordDose: (medicationId: number, status: "taken" | "skipped" | "late") => Promise<void>;
}

export function DoseItemCard({
  medication,
  log,
  onRecordDose,
}: DoseItemCardProps) {
  const isTaken = log?.status === "taken" || log?.status === "late";

  const handleTakeDose = async () => {
    if (medication.id !== undefined && !isTaken) {
      await onRecordDose(medication.id, "taken");
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-nura-slate-200 shadow-2xs flex items-center justify-between gap-3">
      {/* Informações do Medicamento */}
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl shrink-0 ${isTaken ? "bg-emerald-100 text-emerald-600" : "bg-nura-teal-100 text-nura-teal-600"}`}>
          <Pill className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <p className="font-bold text-sm sm:text-base text-nura-slate-900">
            {medication.name}
          </p>
          <p className="text-xs text-nura-slate-600">
            {medication.dosage} • {medication.instructions || "Tomar com água"}
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