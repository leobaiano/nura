import { db } from "@/lib/db";
import { Medication } from "../types";

export const medicationService = {
  async getByProfile(profileId: number): Promise<Medication[]> {
    return await db.medications.where("profileId").equals(profileId).toArray();
  },

  async getById(id: number): Promise<Medication | undefined> {
    return await db.medications.get(id);
  },

  async create(
    medication: Omit<Medication, "id" | "createdAt" | "updatedAt">
  ): Promise<number> {
    const now = new Date();
    return await db.medications.add({
      ...medication,
      createdAt: now,
      updatedAt: now,
    });
  },

  async update(
    id: number,
    medication: Partial<Omit<Medication, "id" | "createdAt">>
  ): Promise<number> {
    const now = new Date();
    return await db.medications.update(id, {
      ...medication,
      updatedAt: now,
    });
  },

  async toggleActive(id: number, active: boolean): Promise<number> {
    const now = new Date();
    return await db.medications.update(id, { active, updatedAt: now });
  },

  async delete(id: number): Promise<void> {
    await db.transaction(
      "rw",
      [db.medications, db.stocks, db.doseLogs],
      async () => {
        await db.stocks.where("medicationId").equals(id).delete();

        await db.doseLogs.where("medicationId").equals(id).delete();

        await db.medications.delete(id);
      }
    );
  },
};