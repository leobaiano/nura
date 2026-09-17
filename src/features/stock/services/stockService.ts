import { db } from "@/lib/db";
import { Stock } from "../types";

export const stockService = {
  async getByMedicationId(medicationId: number): Promise<Stock | undefined> {
    return await db.stocks.where("medicationId").equals(medicationId).first();
  },

  async setStock(
    stockData: Omit<Stock, "id" | "updatedAt">
  ): Promise<number> {
    const existingStock = await this.getByMedicationId(stockData.medicationId);
    const now = new Date();

    if (existingStock?.id) {
      await db.stocks.update(existingStock.id, {
        currentQuantity: stockData.currentQuantity,
        minimumThreshold: stockData.minimumThreshold,
        unit: stockData.unit,
        updatedAt: now,
      });
      return existingStock.id;
    }

    return await db.stocks.add({
      ...stockData,
      updatedAt: now,
    });
  },

  async decrement(medicationId: number, amount: number = 1): Promise<void> {
    const stock = await this.getByMedicationId(medicationId);
    if (!stock || !stock.id) return;

    const newQuantity = Math.max(0, stock.currentQuantity - amount);
    await db.stocks.update(stock.id, {
      currentQuantity: newQuantity,
      updatedAt: new Date(),
    });
  },

  async addQuantity(medicationId: number, amount: number): Promise<void> {
    const stock = await this.getByMedicationId(medicationId);
    if (!stock || !stock.id) return;

    await db.stocks.update(stock.id, {
      currentQuantity: stock.currentQuantity + amount,
      updatedAt: new Date(),
    });
  },
};