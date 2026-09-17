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
        await db.transaction("rw", [db.profiles, db.medications, db.stocks], async () => {
            const medIds = await db.medications
                .where("profileId")
                .equals(id)
                .primaryKeys();

            if (medIds.length > 0) {
                await db.stocks.where("medicationId").anyOf(medIds).delete();
            }

            await db.medications.where("profileId").equals(id).delete();

            await db.profiles.delete(id);
        });
    },

    async ensureDefaultProfile(): Promise<Profile> {
        const defaultProfile = await db.profiles
            .filter((p) => p.isDefault === true)
            .first();

        if (defaultProfile) {
            return defaultProfile;
        }

        const now = new Date();
        const id = await db.profiles.add({
            name: "Eu",
            role: "admin",
            isDefault: true,
            createdAt: now,
            updatedAt: now,
        });

        return {
            id,
            name: "Eu",
            role: "admin",
            isDefault: true,
            createdAt: now,
            updatedAt: now,
        };
    },
};