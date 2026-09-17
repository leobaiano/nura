import { db } from "@/lib/db";
import { DoseLog } from "../types";

export const historyService = {
  async getByProfile(profileId: number): Promise<DoseLog[]> {
    return await db.doseLogs
      .where("profileId")
      .equals(profileId)
      .reverse()
      .sortBy("scheduledTime");
  },

  async getByMedication(medicationId: number): Promise<DoseLog[]> {
    return await db.doseLogs
      .where("medicationId")
      .equals(medicationId)
      .reverse()
      .sortBy("scheduledTime");
  },

  async logDose(
    doseData: Omit<DoseLog, "id" | "createdAt">
  ): Promise<number> {
    return await db.transaction("rw", [db.doseLogs, db.stocks], async () => {
      const now = new Date();

      // 1. Salva o registro da dose no histórico
      const doseId = await db.doseLogs.add({
        ...doseData,
        createdAt: now,
      });

      // 2. Se a dose foi marcada como tomada ou atrasada, diminui 1 unidade do estoque
      if (doseData.status === "taken" || doseData.status === "late") {
        const stock = await db.stocks
          .where("medicationId")
          .equals(doseData.medicationId)
          .first();

        if (stock && stock.id) {
          const newQuantity = Math.max(0, stock.currentQuantity - 1);
          await db.stocks.update(stock.id, {
            currentQuantity: newQuantity,
            updatedAt: now,
          });
        }
      }

      return doseId;
    });
  },

  async deleteLog(id: number): Promise<void> {
    await db.transaction("rw", [db.doseLogs, db.stocks], async () => {
      const log = await db.doseLogs.get(id);
      if (!log) return;

      // Estorna a quantidade no estoque se o log removido era de uma dose consumida
      if (log.status === "taken" || log.status === "late") {
        const stock = await db.stocks
          .where("medicationId")
          .equals(log.medicationId)
          .first();

        if (stock && stock.id) {
          await db.stocks.update(stock.id, {
            currentQuantity: stock.currentQuantity + 1,
            updatedAt: new Date(),
          });
        }
      }

      // Deleta o registro do histórico
      await db.doseLogs.delete(id);
    });
  },
};