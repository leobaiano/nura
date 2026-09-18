"use client";

import { CheckCircle2, AlertTriangle, XCircle, Activity, Info } from "lucide-react";

interface AdherenceReportCardProps {
  stats: {
    total: number;
    taken: number;
    late: number;
    skipped: number;
    adherencePercentage: number | null;
  };
  timeRangeLabel: string;
  isAsNeededOnly?: boolean;
}

export function AdherenceReportCard({
  stats,
  timeRangeLabel,
  isAsNeededOnly = false,
}: AdherenceReportCardProps) {
  const { total, taken, late, skipped, adherencePercentage } = stats;

  // Estado para medicamento exclusivamente sob demanda
  if (isAsNeededOnly) {
    return (
      <div className="bg-white rounded-2xl border border-nura-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-nura-teal-50 rounded-xl text-nura-teal-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-nura-slate-900 text-base">
              Uso Sob Demanda
            </h3>
            <p className="text-xs text-nura-slate-500">
              Período: {timeRangeLabel}
            </p>
          </div>
        </div>

        <div className="bg-nura-slate-50 p-3.5 rounded-xl border border-nura-slate-200/60 flex items-center gap-2 text-xs text-nura-slate-600">
          <Info className="w-4 h-4 text-nura-teal-600 shrink-0" />
          <span>
            Medicamentos sob demanda não possuem horários fixos e não geram taxa de adesão.
          </span>
        </div>

        <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-center">
          <p className="text-xs font-semibold text-emerald-800">Doses Tomadas no Período</p>
          <p className="font-display font-bold text-xl text-emerald-700">{taken + late}</p>
        </div>
      </div>
    );
  }

  // Cor e mensagem dinâmica de acordo com o nível de adesão
  const getAdherenceBadge = (pct: number | null) => {
    if (pct === null) {
      return {
        label: "Sem Dados",
        bgColor: "bg-nura-slate-100 border-nura-slate-200 text-nura-slate-700",
        barColor: "bg-nura-slate-300",
        textColor: "text-nura-slate-700",
      };
    }
    if (pct >= 80) {
      return {
        label: "Excelente Adesão",
        bgColor: "bg-emerald-50 border-emerald-200 text-emerald-800",
        barColor: "bg-emerald-500",
        textColor: "text-emerald-700",
      };
    }
    if (pct >= 50) {
      return {
        label: "Adesão Moderada",
        bgColor: "bg-amber-50 border-amber-200 text-amber-800",
        barColor: "bg-amber-500",
        textColor: "text-amber-700",
      };
    }
    return {
      label: "Atenção Necessária",
      bgColor: "bg-rose-50 border-rose-200 text-rose-800",
      barColor: "bg-rose-500",
      textColor: "text-rose-700",
    };
  };

  const badge = getAdherenceBadge(adherencePercentage);

  return (
    <div className="bg-white rounded-2xl border border-nura-slate-200 p-5 shadow-2xs space-y-4">
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-nura-teal-50 rounded-xl text-nura-teal-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-nura-slate-900 text-base">
              Relatório de Adesão
            </h3>
            <p className="text-xs text-nura-slate-500">
              Período: {timeRangeLabel}
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${badge.bgColor}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Porcentagem e Barra de Progresso */}
      <div className="space-y-2 bg-nura-slate-50/70 p-4 rounded-xl border border-nura-slate-200/60">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-nura-slate-600">
            Taxa de Cumprimento no Prazo
          </span>
          <span className={`font-display text-2xl font-bold ${badge.textColor}`}>
            {adherencePercentage !== null && total > 0 ? `${adherencePercentage}%` : "—"}
          </span>
        </div>

        {/* Barra Visual */}
        <div className="w-full bg-nura-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${badge.barColor}`}
            style={{
              width: `${adherencePercentage !== null && total > 0 ? adherencePercentage : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Resumo das Doses */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>No Prazo</span>
          </div>
          <span className="font-display font-bold text-lg text-emerald-800">
            {taken}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
          <div className="flex items-center justify-center gap-1 text-amber-700 text-xs font-semibold mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Atrasadas</span>
          </div>
          <span className="font-display font-bold text-lg text-amber-800">
            {late}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
          <div className="flex items-center justify-center gap-1 text-rose-700 text-xs font-semibold mb-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Puladas</span>
          </div>
          <span className="font-display font-bold text-lg text-rose-800">
            {skipped}
          </span>
        </div>
      </div>
    </div>
  );
}