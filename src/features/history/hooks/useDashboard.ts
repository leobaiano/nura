import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { medicationService } from "@/features/medications/services/medicationService";
import { historyService } from "../services/historyService";
import { scheduleService } from "@/features/medications/services/scheduleService";
import { notificationService } from "@/features/medications/services/notificationService";
import { useEffect } from "react";
import { Medication } from "@/features/medications/types";
import { DoseLog } from "../types";

export function useDashboard(profileId: number | null) {
  const data = useLiveQuery(async () => {
    if (!profileId) return null;

    const today = new Date();
    const nowTime = today.getTime();

    // 1. Busca todos os medicamentos ativos do perfil
    const allMeds = await medicationService.getByProfile(profileId);
    const activeMeds = allMeds.filter((m: Medication) => m.active);

    // 2. Busca histórico do dia atual
    const allLogs = await historyService.getByProfile(profileId);
    const todayLogs = allLogs.filter((log: DoseLog) => {
      const logDate = new Date(log.scheduledTime);
      return (
        logDate.getFullYear() === today.getFullYear() &&
        logDate.getMonth() === today.getMonth() &&
        logDate.getDate() === today.getDate()
      );
    });

    // 3. Projeta as doses agendadas do dia
    const scheduledDoses = scheduleService.getScheduledDosesForDate(
      activeMeds,
      today
    );

    // 4. Mapeia estoque para alerta de estoque baixo
    const medIds = activeMeds
      .map((m: Medication) => m.id!)
      .filter((id: number | undefined): id is number => id !== undefined);

    const stocks = await db.stocks
      .where("medicationId")
      .anyOf(medIds)
      .toArray();

    const lowStockMeds = activeMeds
      .map((med: Medication) => {
        const stock = stocks.find((s) => s.medicationId === med.id);
        return { ...med, stock };
      })
      .filter(
        (item) =>
          item.stock && item.stock.currentQuantity <= item.stock.minimumThreshold
      );

    // 5. Cálculo Rígido e Preciso das Estatísticas (Tomadas, Atrasadas, Sob Demanda)
    let takenCount = 0;
    let lateCount = 0;
    let skippedCount = 0;

    // A. Conta tomadas sob demanda (logs de remédios sem horário fixo)
    const asNeededLogs = todayLogs.filter((log: DoseLog) => {
      const med = activeMeds.find((m) => m.id === log.medicationId);
      return med?.scheduleType === "as_needed" || !med?.scheduleType;
    });
    takenCount += asNeededLogs.length;

    // B. Avalia cada dose agendada projetada
    scheduledDoses.forEach((item) => {
      if (!item.scheduledTime) return; // Pula sob demanda já contados

      // Procura o log específico para este medicamento E este horário
      const log = todayLogs.find((l: DoseLog) => {
        if (l.medicationId !== item.medication.id) return false;
        const logTimeStr = `${String(new Date(l.scheduledTime).getHours()).padStart(2, "0")}:${String(new Date(l.scheduledTime).getMinutes()).padStart(2, "0")}`;
        return logTimeStr === item.scheduledTime;
      });

      if (log) {
        if (log.status === "taken" || log.status === "late") {
          takenCount++;
        } else if (log.status === "skipped") {
          skippedCount++;
        }
      } else {
        // Se ainda não tem log e a hora agendada já passou, é ATRASADA
        if (item.scheduledDateTime && item.scheduledDateTime.getTime() < nowTime) {
          lateCount++;
        }
      }
    });

    return {
      medications: activeMeds,
      scheduledDoses,
      todayLogs,
      lowStockMeds,
      stats: {
        total: scheduledDoses.length,
        taken: takenCount,
        late: lateCount,
        skipped: skippedCount,
      },
    };
  }, [profileId]);

  // Efeito de Notificação
  useEffect(() => {
    if (!data?.scheduledDoses) return;

    notificationService.requestPermission();

    data.scheduledDoses.forEach((item) => {
      if (item.scheduledDateTime && item.medication.id) {
        const isTaken = data.todayLogs.some(
          (log: DoseLog) => log.medicationId === item.medication.id
        );

        if (!isTaken) {
          notificationService.scheduleDoseReminder(
            item.medication.name,
            `${item.medication.dosage} ${item.medication.unit}`,
            item.scheduledDateTime
          );
        }
      }
    });
  }, [data?.scheduledDoses, data?.todayLogs]);

  const ANTI_OVERDOSE_LIMIT_MINUTES = 60;

  const recordDose = async (
    medicationId: number,
    status: "taken" | "skipped" | "late" = "taken",
    scheduledDateTime?: Date,
    forceOverride: boolean = false // <--- Adicionado parâmetro opcional
  ) => {
    if (!profileId) return;

    const now = new Date();

    // Se for sob demanda, verifica se houve tomada recente para gatilho anti-overdose (exceto se forçado)
    const med = data?.medications.find((m) => m.id === medicationId);
    const isAsNeeded = med?.scheduleType === "as_needed" || !med?.scheduleType;

    if (isAsNeeded && status === "taken" && !forceOverride) {
      const recentLog = data?.todayLogs.find((log: DoseLog) => {
        if (log.medicationId !== medicationId) return false;
        const diffMinutes =
          (now.getTime() - new Date(log.takenAt || log.createdAt).getTime()) /
          (1000 * 60);
        return diffMinutes < ANTI_OVERDOSE_LIMIT_MINUTES;
      });

      if (recentLog) {
        throw {
          code: "ANTI_OVERDOSE_WARNING",
          lastTakenTime: new Date(recentLog.takenAt || recentLog.createdAt),
          minutesAgo: Math.round(
            (now.getTime() - new Date(recentLog.takenAt || recentLog.createdAt).getTime()) /
              (1000 * 60)
          ),
        };
      }
    }

    await historyService.logDose({
      profileId,
      medicationId,
      scheduledTime: scheduledDateTime ?? now,
      takenAt: status === "skipped" ? undefined : now,
      status,
    });
  };

  return {
    medications: data?.medications ?? [],
    scheduledDoses: data?.scheduledDoses ?? [],
    todayLogs: data?.todayLogs ?? [],
    lowStockMeds: data?.lowStockMeds ?? [],
    stats: data?.stats ?? { total: 0, taken: 0, late: 0, skipped: 0 },
    isLoading: data === undefined,
    recordDose,
  };
}