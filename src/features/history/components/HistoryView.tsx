"use client";

import { useHistory, TimeRangeFilter } from "../hooks/useHistory";
import { AdherenceReportCard } from "./AdherenceReportCard";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  Filter,
  Pill,
} from "lucide-react";

interface HistoryViewProps {
  profileId: number;
}

export function HistoryView({ profileId }: HistoryViewProps) {
  const {
    medications,
    groupedLogs,
    stats,
    timeRange,
    setTimeRange,
    selectedMedicationId,
    setSelectedMedicationId,
    isAsNeededOnly,
    isLoading,
    removeLog,
  } = useHistory(profileId);

  const timeRangeLabels: Record<TimeRangeFilter, string> = {
    "7days": "Últimos 7 dias",
    "30days": "Últimos 30 dias",
    month: "Mês Atual",
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-nura-slate-500 text-sm animate-pulse">
        Carregando histórico de doses...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título da Seção */}
      <div>
        <h1 className="font-display text-2xl font-bold text-nura-slate-900">
          Histórico e Adesão
        </h1>
        <p className="text-xs sm:text-sm text-nura-slate-600">
          Acompanhe a consistência do seu tratamento e consulte tomadas passadas.
        </p>
      </div>

      {/* Filtros de Período e Medicamento */}
      <div className="bg-white p-4 rounded-2xl border border-nura-slate-200 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-nura-slate-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtros de Consulta</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Seletor de Período */}
          <div className="flex bg-nura-slate-100 p-1 rounded-xl flex-1">
            {(["7days", "30days", "month"] as TimeRangeFilter[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === range
                    ? "bg-white text-nura-teal-700 shadow-2xs"
                    : "text-nura-slate-600 hover:text-nura-slate-900"
                }`}
              >
                {timeRangeLabels[range]}
              </button>
            ))}
          </div>

          {/* Seletor de Medicamento */}
          <select
            value={selectedMedicationId}
            onChange={(e) =>
              setSelectedMedicationId(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className="h-9 px-3 rounded-xl border border-nura-slate-200 bg-white text-xs font-semibold text-nura-slate-700 focus:outline-none focus:ring-2 focus:ring-nura-teal-500 cursor-pointer"
          >
            <option value="all">Todos os Medicamentos</option>
            {medications.map((med) => (
              <option key={med.id} value={med.id}>
                {med.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Relatório de Adesão */}
      <AdherenceReportCard
            stats={stats}
            timeRangeLabel={timeRangeLabels[timeRange]}
            isAsNeededOnly={isAsNeededOnly}
        />

      {/* Linha do Tempo do Histórico */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-nura-slate-900">
          Registros de Doses
        </h2>

        {groupedLogs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-nura-slate-200 text-center space-y-2 shadow-2xs">
            <Calendar className="w-8 h-8 text-nura-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-nura-slate-800">
              Nenhum registro encontrado
            </p>
            <p className="text-xs text-nura-slate-500 max-w-xs mx-auto">
              Não há registros de doses para os filtros selecionados no período.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedLogs.map((group) => (
              <div key={group.dateKey} className="space-y-2.5">
                {/* Data Agrupada */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-nura-slate-500 bg-nura-slate-200/60 px-2.5 py-0.5 rounded-md">
                    {group.dateLabel}
                  </span>
                  <div className="h-px bg-nura-slate-200 flex-1" />
                </div>

                {/* Lista de Registros do Dia */}
                <div className="space-y-2">
                  {group.logs.map(({ log, medication }) => {
                    const scheduledDate = new Date(log.scheduledTime);
                    const timeStr = scheduledDate.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={log.id}
                        className="bg-white p-3.5 rounded-2xl border border-nura-slate-200/80 shadow-2xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Ícone por Status */}
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              log.status === "taken"
                                ? "bg-emerald-100 text-emerald-700"
                                : log.status === "late"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {log.status === "taken" && (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            {log.status === "late" && (
                              <AlertTriangle className="w-4 h-4" />
                            )}
                            {log.status === "skipped" && (
                              <XCircle className="w-4 h-4" />
                            )}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-nura-slate-900 truncate">
                                {medication?.name || "Medicamento Removido"}
                              </span>

                              <span className="text-[11px] font-semibold bg-nura-slate-100 text-nura-slate-700 px-2 py-0.5 rounded-md">
                                {timeStr}
                              </span>

                              {/* Badge do Status */}
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                  log.status === "taken"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : log.status === "late"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {log.status === "taken" && "Tomado"}
                                {log.status === "late" && "Atrasado"}
                                {log.status === "skipped" && "Não Tomado"}
                              </span>
                            </div>

                            <p className="text-xs text-nura-slate-500 truncate">
                              {medication?.dosage} {medication?.unit}
                              {log.takenAt &&
                                ` • Registrado às ${new Date(
                                  log.takenAt
                                ).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`}
                            </p>
                          </div>
                        </div>

                        {/* Botão para Remover Registro de Histórico */}
                        {log.id !== undefined && (
                          <Button
                            onClick={() => removeLog(log.id!)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-nura-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0"
                            title="Remover este registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}