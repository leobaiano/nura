import Dexie, { type Table } from "dexie";
import { Profile } from "@/features/profiles/types";
import { Medication } from "@/features/medications/types";
import { Stock } from "@/features/stock/types";

// Tipo temporário apenas para a funcionalidade de histórico (US04)
export interface TempDoseLog {
  id?: number;
  medicationId: number;
  profileId: number;
  scheduledTime: Date;
  takenAt?: Date;
  status: string;
  notes?: string;
  createdAt: Date;
}

export class NuraDatabase extends Dexie {
  profiles!: Table<Profile, number>;
  medications!: Table<Medication, number>;
  stocks!: Table<Stock, number>;
  doseLogs!: Table<TempDoseLog, number>;

  constructor() {
    super("NuraDB");

    this.version(1).stores({
      profiles: "++id, name, role, isDefault",
      medications: "++id, profileId, name, scheduleType, active",
      stocks: "++id, medicationId, currentQuantity, minimumThreshold",
      doseLogs: "++id, medicationId, profileId, scheduledTime, status",
    });
  }
}

export const db = new NuraDatabase();