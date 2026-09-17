import Dexie, { type Table } from "dexie";
import { Profile } from "@/features/profiles/types";

// TODO: Tipos temporários enquanto não estruturamos os slices correspondentes
export interface TempMedication {
  id?: number;
  profileId: number;
  name: string;
  dosage: number;
  unit: string;
  instructions?: string;
  scheduleType: string;
  intervalHours?: number;
  specificTimes?: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TempStock {
  id?: number;
  medicationId: number;
  currentQuantity: number;
  minimumThreshold: number;
  unit: string;
  updatedAt: Date;
}

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
  medications!: Table<TempMedication, number>;
  stocks!: Table<TempStock, number>;
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