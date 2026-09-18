"use client";

import { Medication } from "@/features/medications/types";
import { PackageX } from "lucide-react";

interface LowStockAlertProps {
  medications: Medication[];
}

export function LowStockAlert({ medications }: LowStockAlertProps) {
  if (medications.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
      <PackageX className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="text-xs sm:text-sm font-bold text-amber-900">
          Atenção ao estoque de medicamentos
        </p>
        <p className="text-xs text-amber-800 leading-relaxed">
          Os seguintes remédios estão perto do fim:{" "}
          <strong>{medications.map((m) => m.name).join(", ")}</strong>.
          Providencie a reposição.
        </p>
      </div>
    </div>
  );
}