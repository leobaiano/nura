import { db } from "@/lib/db";
import { Profile } from "../types";

export const profileService = {
  async getAll(): Promise<Profile[]> {
    return await db.profiles.toArray();
  },

  async getById(id: number): Promise<Profile | undefined> {
    return await db.profiles.get(id);
  },

  async create(
    profile: Omit<Profile, "id" | "createdAt" | "updatedAt">
  ): Promise<number> {
    const now = new Date();

    // Se for o primeiro perfil do sistema, torna-o default automaticamente
    const count = await db.profiles.count();
    const isDefault = count === 0 ? true : profile.isDefault ?? false;

    return await db.profiles.add({
      ...profile,
      isDefault,
      createdAt: now,
      updatedAt: now,
    });
  },

  async update(
    id: number,
    profile: Partial<Omit<Profile, "id" | "createdAt">>
  ): Promise<number> {
    const now = new Date();
    return await db.profiles.update(id, {
      ...profile,
      updatedAt: now,
    });
  },

  async delete(id: number): Promise<void> {
    await db.transaction(
      "rw",
      [db.profiles, db.medications, db.stocks, db.doseLogs],
      async () => {
        // 1. Busca as chaves primárias dos medicamentos do perfil
        const medIds = await db.medications
          .where("profileId")
          .equals(id)
          .primaryKeys();

        // 2. Se existirem medicamentos, remove estoques e histórico desses medicamentos
        if (medIds.length > 0) {
          await db.stocks.where("medicationId").anyOf(medIds).delete();
          await db.doseLogs.where("medicationId").anyOf(medIds).delete();
        }

        // 3. Remove os históricos atribuídos diretamente ao profileId (caso existam)
        await db.doseLogs.where("profileId").equals(id).delete();

        // 4. Remove os medicamentos e o perfil
        await db.medications.where("profileId").equals(id).delete();
        await db.profiles.delete(id);
      }
    );
  },
};