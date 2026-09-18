"use client";

import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

interface DoseSummaryCardsProps {
  stats: {
    total: number;
    taken: number;
    skipped: number;
    late: number;
  };
}

export function DoseSummaryCards({ stats }: DoseSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {/* Tomadas */}
      <div className="bg-emerald-50/80 border border-emerald-200/60 p-3.5 rounded-2xl flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-emerald-900">Tomadas</p>
          <p className="font-display font-bold text-xl text-emerald-700">
            {stats.taken}
          </p>
        </div>
      </div>

      {/* Atrasadas */}
      <div className="bg-amber-50/80 border border-amber-200/60 p-3.5 rounded-2xl flex items-center gap-3">
        <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-900">Atrasadas</p>
          <p className="font-display font-bold text-xl text-amber-700">
            {stats.late}
          </p>
        </div>
      </div>

      {/* Puladas */}
      <div className="bg-rose-50/80 border border-rose-200/60 p-3.5 rounded-2xl flex items-center gap-3 col-span-2 sm:col-span-1">
        <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
          <XCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-rose-900">Não Tomadas</p>
          <p className="font-display font-bold text-xl text-rose-700">
            {stats.skipped}
          </p>
        </div>
      </div>
    </div>
  );
}