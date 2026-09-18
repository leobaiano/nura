import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { historyService } from "../services/historyService";
import { medicationService } from "@/features/medications/services/medicationService";
import { DoseLog } from "../types";
import { Medication } from "@/features/medications/types";

export type TimeRangeFilter = "7days" | "30days" | "month";

export interface GroupedHistoryLogs {
  dateLabel: string;
  dateKey: string;
  logs: Array<{
    log: DoseLog;
    medication?: Medication;
  }>;
}

export function useHistory(profileId?: number) {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>("7days");
  const [selectedMedicationId, setSelectedMedicationId] = useState<number | "all">("all");

  const data = useLiveQuery(async () => {
    if (!profileId) return null;

    const medications = await medicationService.getByProfile(profileId);
    const allLogs = await historyService.getByProfile(profileId);

    const now = new Date();
    const startDate = new Date();

    if (timeRange === "7days") {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "30days") {
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === "month") {
      startDate.setDate(1);
    }
    startDate.setHours(0, 0, 0, 0);

    // Filtra logs por data e por medicamento
    const filteredLogs = allLogs.filter((log: DoseLog) => {
      const logDate = new Date(log.scheduledTime);
      const isWithinDate = logDate >= startDate;

      const isMatchingMedication =
        selectedMedicationId === "all" || log.medicationId === selectedMedicationId;

      return isWithinDate && isMatchingMedication;
    });

    // Agrupa os logs por data
    const groupedMap = new Map<string, GroupedHistoryLogs>();

    filteredLogs.forEach((log: DoseLog) => {
      const dateObj = new Date(log.scheduledTime);
      const dateKey = dateObj.toISOString().split("T")[0];

      const isToday = new Date().toISOString().split("T")[0] === dateKey;
      const yesterdayObj = new Date();
      yesterdayObj.setDate(yesterdayObj.getDate() - 1);
      const isYesterday = yesterdayObj.toISOString().split("T")[0] === dateKey;

      let dateLabel = dateObj.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });

      if (isToday) dateLabel = "Hoje";
      if (isYesterday) dateLabel = "Ontem";

      const med = medications.find((m: Medication) => m.id === log.medicationId);

      if (!groupedMap.has(dateKey)) {
        groupedMap.set(dateKey, {
          dateLabel,
          dateKey,
          logs: [],
        });
      }

      groupedMap.get(dateKey)!.logs.push({
        log,
        medication: med,
      });
    });

    const groupedLogs = Array.from(groupedMap.values()).sort(
      (a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime()
    );

    // Verifica se o medicamento selecionado é "Sob Demanda"
    const selectedMed = medications.find((m) => m.id === selectedMedicationId);
    const isAsNeededOnly =
      selectedMedicationId !== "all" &&
      selectedMed &&
      (selectedMed.scheduleType === "as_needed" || !selectedMed.scheduleType);

    // Métricas
    const totalLogs = filteredLogs.length;
    const takenLogs = filteredLogs.filter((l) => l.status === "taken").length;
    const lateLogs = filteredLogs.filter((l) => l.status === "late").length;
    const skippedLogs = filteredLogs.filter((l) => l.status === "skipped").length;

    // Apenas doses rigorosamente NO PRAZO contam para a taxa de adesão 100%
    const adherencePercentage =
      isAsNeededOnly
        ? null
        : totalLogs > 0
        ? Math.round((takenLogs / totalLogs) * 100)
        : 100;

    return {
      history: allLogs,
      medications,
      groupedLogs,
      rawLogs: filteredLogs,
      isAsNeededOnly,
      stats: {
        total: totalLogs,
        taken: takenLogs,
        late: lateLogs,
        skipped: skippedLogs,
        adherencePercentage,
      },
    };
  }, [profileId, timeRange, selectedMedicationId]);

  const registerDose = async (data: Omit<DoseLog, "id" | "createdAt">) => {
    return await historyService.logDose(data);
  };

  const removeLog = async (id: number) => {
    return await historyService.deleteLog(id);
  };

  return {
    history: data?.history ?? [],
    medications: data?.medications ?? [],
    groupedLogs: data?.groupedLogs ?? [],
    isAsNeededOnly: data?.isAsNeededOnly ?? false,
    stats: data?.stats ?? {
      total: 0,
      taken: 0,
      late: 0,
      skipped: 0,
      adherencePercentage: 100,
    },
    timeRange,
    setTimeRange,
    selectedMedicationId,
    setSelectedMedicationId,
    isLoading: data === undefined,
    registerDose,
    removeLog,
  };
}