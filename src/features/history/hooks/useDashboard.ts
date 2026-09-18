import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { historyService } from "../services/historyService";

export function useDashboard(profileId: number | null) {
  const data = useLiveQuery(async () => {
    if (!profileId) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Busca medicamentos do perfil ativo
    const medications = await db.medications
      .where("profileId")
      .equals(profileId)
      .toArray();

    // 2. Busca histórico de doses de hoje
    const todayLogs = await db.doseLogs
      .where("profileId")
      .equals(profileId)
      .filter((log) => {
        if (!log.takenAt) return false;
        const logDate = new Date(log.takenAt);
        return logDate >= today && logDate < tomorrow;
      })
      .toArray();

    // 3. Busca estoques baixos
    const medIds = medications
      .map((m) => m.id!)
      .filter((id): id is number => id !== undefined);

    const stocks = await db.stocks
      .where("medicationId")
      .anyOf(medIds)
      .toArray();

    const lowStockMeds = medications.filter((med) => {
      const stock = stocks.find((s) => s.medicationId === med.id);
      return stock ? stock.currentQuantity <= stock.minimumThreshold : false;
    });

    // Métricas do Dia ("taken" | "skipped" | "late")
    const taken = todayLogs.filter((l) => l.status === "taken").length;
    const skipped = todayLogs.filter((l) => l.status === "skipped").length;
    const late = todayLogs.filter((l) => l.status === "late").length;

    return {
      medications,
      todayLogs,
      lowStockMeds,
      stats: {
        total: todayLogs.length,
        taken,
        skipped,
        late,
      },
    };
  }, [profileId]);

  const recordDose = async (
    medicationId: number,
    status: "taken" | "skipped" | "late",
    notes?: string
  ) => {
    if (!profileId) return;

    const now = new Date();

    await historyService.logDose({
      profileId,
      medicationId,
      scheduledTime: now,
      takenAt: now,
      status,
      notes,
    });
  };

  return {
    medications: data?.medications ?? [],
    todayLogs: data?.todayLogs ?? [],
    lowStockMeds: data?.lowStockMeds ?? [],
    stats: data?.stats ?? { total: 0, taken: 0, skipped: 0, late: 0 },
    isLoading: data === undefined,
    recordDose,
  };
}