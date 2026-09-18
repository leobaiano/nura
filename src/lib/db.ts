import Dexie, { type Table } from "dexie";
import { Profile } from "@/features/profiles/types";
import { Medication } from "@/features/medications/types";
import { Stock } from "@/features/stock/types";
import { DoseLog } from "@/features/history/types";
import { DismissedAnnouncement } from "@/features/announcements/types";

export class NuraDatabase extends Dexie {
  profiles!: Table<Profile, number>;
  medications!: Table<Medication, number>;
  stocks!: Table<Stock, number>;
  doseLogs!: Table<DoseLog, number>;
  dismissedAnnouncements!: Table<DismissedAnnouncement, number>;

  constructor() {
    super("NuraDB");

    this.version(1).stores({
      profiles: "++id, name, role, isDefault",
      medications: "++id, profileId, name, scheduleType, active",
      stocks: "++id, medicationId, currentQuantity, minimumThreshold",
      doseLogs: "++id, medicationId, profileId, scheduledTime, status",
    });

    this.version(2).stores({
      profiles: "++id, name, role, isDefault",
      medications: "++id, profileId, name, scheduleType, active",
      stocks: "++id, medicationId, currentQuantity, minimumThreshold",
      doseLogs: "++id, medicationId, profileId, scheduledTime, status",
      dismissedAnnouncements: "++id, announcementId",
    });
  }
}

export const db = new NuraDatabase();